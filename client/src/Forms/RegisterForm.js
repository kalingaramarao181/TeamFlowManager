import React, { useState } from "react";
import "./RegisterForm.css";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { sendOtp, verifyOtp, registerUser } from "../api/authApi";
import FormView from "./FormView";

const RegisterForm = ({ isPopupOpen, closePopup }) => {
  const [formData, setFormData] = useState({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openForm, setOpenForm] = useState(null);

  const validateEmail = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email.");
      return false;
    }
    return true;
  };


  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateEmail() || !validatePasswords()) return;
    if (isOtpSent)
      return setErrorMessage("OTP already sent. Please check your email.");

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await sendOtp(payload);

      Cookies.set("otpToken", response.data.token, { expires: 5 / (24 * 60) });
      setIsOtpSent(true);
      console.log("OTP sent to your email!");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
        console.log(error.response.status);
      } else {
        console.error("Error sending OTP", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6)
      return toast.error("Please enter the full OTP.");

    setLoading(true);
    try {
      const response = await verifyOtp(
        formData.email,
        otp,
        Cookies.get("otpToken")
      );

      Cookies.set("registerToken", response.registerToken, {
        expires: 10 / (24 * 60),
      });

      await registerUser({
        ...formData,
        role: 3,
        token: response.registerToken,
      });

      setShowSuccessPopup(true);
    } catch (error) {
      if (error.status === 401) {
        setErrorMessage("Invalid OTP. Please try again.");

        setIsOtpSent(false);
      } else {
        setErrorMessage("Error verifying OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    window.location.reload();
  };

  return (
    <>
      <h2 className="cvb-signup-heading">Sign Up</h2>
      <form
        className="cvb-login-form"
        onSubmit={!isOtpSent ? handleSendOtp : handleVerifyOtp}
      >
        <label className="cvb-login-label">Full Name <span className='cvb-edu-mandatory'>*</span></label>
        <input
          type="text"
          className="cvb-login-input"
          placeholder="Enter your name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <label className="cvb-login-label">Email <span className='cvb-edu-mandatory'>*</span></label>
        <input
          type="email"
          className="cvb-login-input"
          placeholder="Enter your email"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <label className="cvb-login-label">Password <span className='cvb-edu-mandatory'>*</span></label>
        <input
          type="password"
          className="cvb-login-input"
          placeholder="Enter your password"
          value={formData.password || ""}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <label className="cvb-login-label">Confirm Password <span className='cvb-edu-mandatory'>*</span></label>
        <input
          type="password"
          className="cvb-login-input"
          placeholder="Confirm your password"
          value={formData.confirmPassword || ""}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />

        {isOtpSent && (
          <div className="signup-otp-container">
            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="cvb-login-input"
            />
          </div>
        )}

        <button
          type="submit"
          className="login-popup-login-button"
          disabled={loading}
        >
          {loading
            ? isOtpSent
              ? "Verifying..."
              : "Sending..."
            : isOtpSent
            ? "Verify OTP"
            : "Send OTP"}
        </button>
        {errorMessage && <p className="order-error-message">{errorMessage}</p>}
      </form>
      <p>Have an account? Keep<button onClick={() => setOpenForm("signin")} className="tfm-signup-button">Login Here</button></p>
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-header-container">
            <p>Registration successful!</p>
            <button onClick={handleSuccessPopupClose}>OK</button>
          </div>
        </div>
      )}
      <FormView openForm={openForm} setOpenForm={setOpenForm} />
    </>
  );
};

export default RegisterForm;
