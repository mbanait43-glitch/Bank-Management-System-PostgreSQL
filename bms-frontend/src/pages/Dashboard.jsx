import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const baseUrl = "http://localhost:5265/api/Bank";
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [profileName, setProfileName] = useState(localStorage.getItem("name") || "User");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "User",
    email: localStorage.getItem("email") || "",
    accountNumber: localStorage.getItem("accountNumber") || "Not available",
    balance: 0,
  });
  const [balance, setBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [toast, setToast] = useState({ show: false, text: "" });

  const api = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  const showToast = (text) => {
    setToast({ show: true, text });
    setTimeout(() => setToast({ show: false, text: "" }), 2200);
  };

  const handleApiError = (error, fallback) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate("/sign-in");
      return;
    }
    const data = error.response?.data;
    alert(typeof data === "string" ? data : fallback);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, transRes, summaryRes] = await Promise.all([
        api.get(`/profile/${userId}`),
        api.get(`/transactions/${userId}`),
        api.get(`/summary/${userId}`),
      ]);
      setProfile(profileRes.data);
      setProfileName(profileRes.data.name);
      setBalance(Number(profileRes.data.balance) || 0);
      setTransactions(transRes.data || []);
      setSummary(summaryRes.data || {});
      localStorage.setItem("name", profileRes.data.name);
      localStorage.setItem("email", profileRes.data.email);
      localStorage.setItem("accountNumber", profileRes.data.accountNumber);

      if (isAdmin) {
        const [usersRes, accountsRes, adminTransRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/accounts"),
          api.get("/admin/transactions"),
        ]);
        setUsers(usersRes.data || []);
        setAdminAccounts(accountsRes.data || []);
        setAdminTransactions(adminTransRes.data || []);
      }
    } catch (error) {
      handleApiError(error, "Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deposit = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    try {
      await api.post(`/deposit/${userId}`, { amount: Number(amount) });
      setAmount("");
      await fetchData();
      showToast("Money deposited successfully");
    } catch (error) {
      handleApiError(error, "Deposit failed");
    }
  };

  const withdraw = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    try {
      await api.post(`/withdraw/${userId}`, { amount: Number(amount) });
      setAmount("");
      await fetchData();
      showToast("Money withdrawn successfully");
    } catch (error) {
      handleApiError(error, "Withdraw failed");
    }
  };

  const transferMoney = async () => {
    if (!receiverAccount.trim()) return alert("Enter receiver account number");
    if (!transferAmount || Number(transferAmount) <= 0) return alert("Enter valid amount");
    try {
      await api.post(`/transfer/${userId}`, {
        receiverAccountNumber: receiverAccount.trim(),
        amount: Number(transferAmount),
      });
      setReceiverAccount("");
      setTransferAmount("");
      await fetchData();
      showToast("Money transferred successfully");
    } catch (error) {
      handleApiError(error, "Transfer failed");
    }
  };

  const updateProfile = async () => {
    if (!profileName.trim()) return alert("Name cannot be empty");
    try {
      await api.put(`/profile/${userId}`, { name: profileName.trim() });
      await fetchData();
      showToast("Profile updated successfully");
    } catch (error) {
      handleApiError(error, "Profile update failed");
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword || newPassword.length < 6) return alert("Enter old password and 6+ character new password");
    try {
      await api.put(`/profile/${userId}/password`, { oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      showToast("Password changed successfully");
    } catch (error) {
      handleApiError(error, "Password change failed");
    }
  };

  const toggleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      await fetchData();
      showToast("User status updated");
    } catch (error) {
      handleApiError(error, "Admin action failed");
    }
  };

  const updateAccountStatus = async (accountId, status) => {
    try {
      await api.patch(`/admin/accounts/${accountId}/status`, { status });
      await fetchData();
      showToast(`Account moved to ${status}`);
    } catch (error) {
      handleApiError(error, "Account status update failed");
    }
  };

  const downloadStatement = () => {
    const rows = filteredTransactions.map((t) => `
      <tr><td>${t.id}</td><td>${t.type}</td><td>Rs. ${t.amount}</td><td>Rs. ${t.balanceAfterTransaction}</td><td>${t.receiverAccountNumber ? `To: ${t.receiverAccountNumber}` : t.senderAccountNumber ? `From: ${t.senderAccountNumber}` : "-"}</td><td>${new Date(t.transactionDate).toLocaleString()}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BMS Statement</title><style>body{font-family:Arial;padding:30px;color:#111}h1{color:#0179fe}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:10px;text-align:left}th{background:#eef6ff}.meta{line-height:1.8}</style></head><body><h1>Sidha Sadha Bank - Account Statement</h1><div class="meta"><b>Name:</b> ${profile.name}<br/><b>Email:</b> ${profile.email}<br/><b>Account No:</b> ${profile.accountNumber}<br/><b>Current Balance:</b> Rs. ${profile.balance}<br/><b>Generated:</b> ${new Date().toLocaleString()}</div><table><thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Account Info</th><th>Date</th></tr></thead><tbody>${rows || "<tr><td colspan='6'>No transactions</td></tr>"}</tbody></table><script>window.print()</script></body></html>`;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  useEffect(() => {
    if (!token) return navigate("/sign-in");
    fetchData();
  }, []);

  useEffect(() => {
    let start = displayBalance;
    const end = balance;
    if (start === end) return;
    const steps = 35;
    const increment = (end - start) / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep += 1;
      start += increment;
      if (currentStep >= steps) {
        setDisplayBalance(end);
        clearInterval(timer);
      } else {
        setDisplayBalance(Math.round(start));
      }
    }, 35);
    return () => clearInterval(timer);
  }, [balance]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = `${t.type} ${t.amount} ${t.id} ${t.receiverAccountNumber || ""} ${t.senderAccountNumber || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || t.type.includes(typeFilter);
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const depositCount = transactions.filter((t) => t.type === "Deposit").length;
  const withdrawCount = transactions.filter((t) => t.type === "Withdraw").length;
  const transferCount = transactions.filter((t) => t.type.includes("Transfer")).length;
  const recentTransactions = transactions.slice(0, 5);
  const chartMax = Math.max(...transactions.map((t) => Number(t.amount) || 0), 1);

  if (loading) return <div className="loading-screen"><div className="loader"></div><p>Loading dashboard...</p></div>;

  return (
    <div className="dashboard-shell">
      {toast.show && <div className="toast-popup"><span className="toast-check">✓</span><span>{toast.text}</span></div>}

      <aside className="premium-sidebar">
        <div>
          <div className="sidebar-logo">🏦</div>
          <nav className="sidebar-nav">
            <button className={activePage === "home" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("home")}><span className="nav-icon">🏠</span><span className="nav-text">Home</span></button>
            <button className={activePage === "accounts" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("accounts")}><span className="nav-icon">💳</span><span className="nav-text">Accounts</span></button>
            <button className={activePage === "transfer" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("transfer")}><span className="nav-icon">🔁</span><span className="nav-text">Transfer Money</span></button>
            <button className={activePage === "transactions" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("transactions")}><span className="nav-icon">📜</span><span className="nav-text">Transactions</span></button>
            <button className={activePage === "profile" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("profile")}><span className="nav-icon">👤</span><span className="nav-text">Profile</span></button>
            {isAdmin && <button className={activePage === "admin" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("admin")}><span className="nav-icon">🛡️</span><span className="nav-text">Admin Panel</span></button>}
            <button className={activePage === "help" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("help")}><span className="nav-icon">❓</span><span className="nav-text">Help</span></button>
          </nav>
        </div>
        <button className="logout-btn" onClick={logout}><span className="nav-icon">🚪</span><span className="nav-text">Logout</span></button>
      </aside>

      <main className="dashboard-main-area">
        <div className="dashboard-topbar">
          <div><h1 className="bank-title">🏦 Sidha Sadha Bank</h1><p className="welcome-text">Welcome back, <span className="user-name-blue">{profile.name}</span></p></div>
          <div className="topbar-right"><div className="topbar-search"><input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><button className="icon-circle" onClick={downloadStatement} title="Download statement">⬇️</button><div className="profile-mini"><div className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</div></div></div>
        </div>

        {activePage === "home" && (
          <section>
            <div className="hero-card"><p className="hero-small">Secure Full Stack Banking Dashboard</p><h2>JWT protected banking with SQL Server database storage</h2><p className="hero-desc">Manage account balance, deposit, withdraw, transfer money, view profile, download statement, and track transaction history.</p></div>
            <div className="summary-grid"><div className="summary-card"><p>Total Balance</p><h2 className="balance-green balance-animated">₹ {displayBalance}</h2></div><div className="summary-card"><p>Deposits</p><h2>{depositCount}</h2></div><div className="summary-card"><p>Transfers</p><h2>{transferCount}</h2></div><div className="summary-card"><p>This Month</p><h2>₹ {summary.monthlyDeposited || 0}</h2></div></div>
            <div className="home-grid"><div className="chart-card"><div className="table-header"><h3>Transaction Chart</h3></div><div className="mini-chart">{transactions.length > 0 ? transactions.slice(0, 8).reverse().map((t) => <div className="chart-col" key={t.id}><div className={t.type === "Deposit" || t.type === "Transfer Received" ? "chart-bar blue-bar" : "chart-bar light-blue-bar"} style={{ height: `${Math.max((Number(t.amount) / chartMax) * 140, 18)}px` }} /><span>{t.id}</span></div>) : <p className="empty-text">No data to display</p>}</div></div><div className="profile-card"><div className="profile-avatar large-avatar">{profile.name.charAt(0).toUpperCase()}</div><h3>{profile.name}</h3><p>{profile.email}</p><p>Account No: {profile.accountNumber}</p><div className="profile-badge">{isAdmin ? "Admin Account" : `${profile.accountStatus || "Active"} Account`}</div></div></div>
          </section>
        )}

        {activePage === "accounts" && (
          <section><div className="summary-grid"><div className="summary-card wide-card"><p>Total Balance</p><h2 className="balance-green balance-animated">₹ {displayBalance}</h2><p>Account No: {profile.accountNumber}</p><p>Status: {profile.accountStatus || "Active"}</p></div><div className="summary-card"><p>Total Withdrawn</p><h2>₹ {summary.totalWithdrawn || 0}</h2></div></div><div className="account-actions-card"><h3 className="section-title-bold">Deposit / Withdraw</h3><p className="section-subtext">Enter amount and choose action.</p><input className="amount-white-input" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} /><div className="action-buttons-row"><button className="deposit-btn" onClick={deposit}>Deposit Money</button><button className="withdraw-btn" onClick={withdraw}>Withdraw Money</button></div></div><TransactionTable title="Recent Transactions" transactions={recentTransactions} /></section>
        )}

        {activePage === "transfer" && (
          <section className="account-actions-card"><h3 className="section-title-bold">Transfer Money</h3><p className="section-subtext">Send money to another BMS account number.</p><input className="amount-white-input" type="text" placeholder="Receiver account number" value={receiverAccount} onChange={(e) => setReceiverAccount(e.target.value)} /><input className="amount-white-input" type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} /><button className="deposit-btn full-btn" onClick={transferMoney}>Transfer Now</button></section>
        )}

        {activePage === "transactions" && <section><div className="filter-row"><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option>All</option><option>Deposit</option><option>Withdraw</option><option>Transfer</option></select><button className="deposit-btn" onClick={downloadStatement}>Download Statement as PDF</button></div><TransactionTable title="Transaction History" transactions={filteredTransactions} /></section>}

        {activePage === "profile" && (
          <section className="help-grid"><div className="panel-card"><h3>Profile Details</h3><p><b>Name:</b> {profile.name}</p><p><b>Email:</b> {profile.email}</p><p><b>Account No:</b> {profile.accountNumber}</p><p><b>Status:</b> {profile.accountStatus || "Active"}</p><p><b>Balance:</b> ₹ {profile.balance}</p></div><div className="panel-card"><h3>Update Profile</h3><input className="amount-white-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} /><button className="deposit-btn full-btn" onClick={updateProfile}>Update Name</button></div><div className="panel-card"><h3>Change Password</h3><input className="amount-white-input" type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /><input className="amount-white-input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><button className="withdraw-btn full-btn" onClick={changePassword}>Change Password</button></div></section>
        )}

        {activePage === "admin" && isAdmin && (
          <section>
            <div className="summary-grid">
              <div className="summary-card"><p>Total Users</p><h2>{users.length}</h2></div>
              <div className="summary-card"><p>Total Accounts</p><h2>{adminAccounts.length}</h2></div>
              <div className="summary-card"><p>Total Transactions</p><h2>{adminTransactions.length}</h2></div>
            </div>

            <section className="table-card">
              <div className="table-header"><h3>Admin Panel - All Users</h3></div>
              {users.length > 0 ? <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Account</th><th>Balance</th><th>User Status</th><th>Account Status</th><th>Action</th></tr></thead><tbody>{users.map((u) => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.accountNumber}</td><td>₹ {u.balance}</td><td>{u.isBlocked ? "Blocked" : "Active"}</td><td><span className={u.accountStatus === "Active" ? "status-badge green-badge" : "status-badge red-badge"}>{u.accountStatus}</span></td><td>{!u.isAdmin && <button className="small-action-btn" onClick={() => toggleBlock(u.id)}>{u.isBlocked ? "Unblock User" : "Block User"}</button>}</td></tr>)}</tbody></table> : <p className="empty-text">No users found</p>}
            </section>

            <AdminAccountsTable accounts={adminAccounts} updateAccountStatus={updateAccountStatus} />
            <AdminTransactionTable transactions={adminTransactions.slice(0, 20)} />
          </section>
        )}

        {activePage === "help" && (
          <section className="help-grid"><div className="panel-card"><h3>Customer Support</h3><p>Email: support@sidhasadhabank.com</p><p>Call: +91 98765 43210</p><p className="section-subtext">Demo support section for project presentation.</p></div><div className="panel-card"><h3>Project Features</h3><p>React frontend, ASP.NET Core Web API, SQL Server, EF Core, JWT auth, PBKDF2 password hashing, role-based admin panel, fund transfer, PDF statement, filters, loading UI, profile and transaction history.</p></div></section>
        )}
      </main>
    </div>
  );
}

function TransactionTable({ title, transactions }) {
  return <section className="table-card"><div className="table-header"><h3>{title}</h3></div>{transactions.length > 0 ? <table><thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Account Info</th><th>Date</th></tr></thead><tbody>{transactions.map((t) => <tr key={t.id}><td>{t.id}</td><td><span className={t.type === "Deposit" || t.type === "Transfer Received" ? "status-badge green-badge" : "status-badge red-badge"}>{t.type}</span></td><td>₹ {t.amount}</td><td>₹ {t.balanceAfterTransaction}</td><td>{t.receiverAccountNumber ? `To: ${t.receiverAccountNumber}` : t.senderAccountNumber ? `From: ${t.senderAccountNumber}` : "-"}</td><td>{t.transactionDate ? new Date(t.transactionDate).toLocaleString() : "-"}</td></tr>)}</tbody></table> : <p className="empty-text">No transactions found</p>}</section>;
}

function AdminAccountsTable({ accounts, updateAccountStatus }) {
  return <section className="table-card"><div className="table-header"><h3>Admin Panel - Account Controls</h3></div>{accounts.length > 0 ? <table><thead><tr><th>ID</th><th>User</th><th>Email</th><th>Account No</th><th>Balance</th><th>Status</th><th>Change Status</th></tr></thead><tbody>{accounts.map((a) => <tr key={a.id}><td>{a.id}</td><td>{a.userName}</td><td>{a.userEmail}</td><td>{a.accountNumber}</td><td>₹ {a.balance}</td><td><span className={a.status === "Active" ? "status-badge green-badge" : "status-badge red-badge"}>{a.status}</span></td><td><select value={a.status} onChange={(e) => updateAccountStatus(a.id, e.target.value)}><option>Active</option><option>Hold</option><option>Blocked</option></select></td></tr>)}</tbody></table> : <p className="empty-text">No accounts found</p>}</section>;
}

function AdminTransactionTable({ transactions }) {
  return <section className="table-card"><div className="table-header"><h3>Admin Panel - Recent Transactions</h3></div>{transactions.length > 0 ? <table><thead><tr><th>ID</th><th>User</th><th>Email</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead><tbody>{transactions.map((t) => <tr key={t.id}><td>{t.id}</td><td>{t.userName}</td><td>{t.userEmail}</td><td>{t.type}</td><td>₹ {t.amount}</td><td>{new Date(t.transactionDate).toLocaleString()}</td></tr>)}</tbody></table> : <p className="empty-text">No transactions found</p>}</section>;
}

export default Dashboard;
