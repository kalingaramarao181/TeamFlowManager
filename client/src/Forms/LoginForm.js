import React, { useState } from "react";
import "./LoginForm.css";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import FormView from "./FormView";

const LoginForm = ({ isPopupOpen, closePopup, role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(
        { email, password }, navigate
      );
      if (response.user.role === "user") {
        navigate("/dashboard/work");
        return
      }
      navigate("/dashboard")
      closePopup();
    } catch (error) {
      if (error) {
        setErrorMessage(error.message || "Login failed. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="tfm-login-heading">Welcome to User</h2>  
      <form className="tfm-login-form" onSubmit={handleSubmit}>
        <label className="tfm-login-label">Email <span className='tfm-edu-mandatory'>*</span></label>
        <input
          type="email"
          className="tfm-login-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="tfm-login-label">Password <span className='tfm-edu-mandatory'>*</span></label>
        <input
          type="password"
          className="tfm-login-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="login-popup-login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
      <p><button onClick={() => setOpenForm("password")} className="tfm-signup-button">Forgot Password</button>/Don't have an account? <button onClick={() => setOpenForm("register")} className="tfm-signup-button">Sign Up</button></p>

      {errorMessage && (
        <p className="login-error-message">
          {errorMessage}
        </p>
      )}
      <FormView openForm={openForm} setOpenForm={setOpenForm} />
    </>
  );
};

export default LoginForm;
