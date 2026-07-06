import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const baseUrl = "http://localhost:5265/api/Bank";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseUrl}/login`, {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("accountNumber", res.data.accountNumber || "");
      localStorage.setItem("token", res.data.token || "");
      localStorage.setItem("isAdmin", res.data.isAdmin ? "true" : "false");

      alert(res.data.message);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-box">
          <h3 className="brand">🏦 Sidhi Sadhi Bank</h3>
          <h1>Sign In</h1>
          <p>Please enter your details.</p>

          <form onSubmit={handleSignIn}>
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">Sign In</button>
          </form>

          <p className="switch-text">
            Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="preview-card">
          <h2>Smart Banking Experience</h2>
          <p>Access your account and manage transactions with a simple dashboard.</p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;