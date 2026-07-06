import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function SignUp() {
  const navigate = useNavigate();
  const baseUrl = "http://localhost:5265/api/Bank";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseUrl}/register`, formData);
      alert(res.data.message);
      navigate("/sign-in");
    } catch (error) {
      alert(error.response?.data || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-box">
          <h3 className="brand">🏦 Horizon Bank</h3>
          <h1>Create Account</h1>
          <p>Create your banking account to continue.</p>

          <form onSubmit={handleSignUp}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">Sign Up</button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="preview-card">
          <h2>Clean Banking Dashboard</h2>
          <p>Track balance, deposit, withdraw, and view transaction history.</p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;