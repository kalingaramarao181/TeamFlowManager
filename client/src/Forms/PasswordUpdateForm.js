import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./PasswordUpdateForm.css";
import {
  sendResetOtp,
  updatePassword,
  verifyResetOtp,
} from "../api/authApi";

const PasswordUpdate = ({ handleTabClick }) => {
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginDetails({
      ...loginDetails,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Handle OTP Input
  const handleOTPChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) e.target.nextSibling?.focus();
    }
  };

  // Validate Email
  const validateEmail = () => {
    let isValid = true;
    let formErrors = { ...errors };

    if (!loginDetails.email) {
      formErrors.email = "Email is required.";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(
        loginDetails.email
      )
    ) {
      formErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    if (isOtpSent)
      return toast.warn("OTP already sent. Please check your email.");

    setLoading(true);
    try {
      const response = await sendResetOtp(loginDetails.email);
      if (response.status !== 200) {
        throw new Error("Failed to send OTP.");
      }
      Cookies.set("otpToken", response.data.token, { expires: 5 });
      setIsOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP.");
      setErrors({ ...errors, email: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.includes("")) return toast.error("Please enter the full OTP.");
    setLoading(true);
    try {
      const response = await verifyResetOtp(
        loginDetails.email,
        otp.join(""),
        Cookies.get("otpToken")
      );
      Cookies.set("resetToken", response.data.resetToken, { expires: 10 });
      setIsOtpVerified(true);
      toast.success("OTP Verified! Set your new password.");
    } catch (error) {
      console.error("Verify OTP Error:", error);
      if (error.response?.status === 401) {
        toast.error("Invalid or expired OTP. Please request a new one.");
        setErrors({ ...errors, email: "Invalid or expired OTP." });
        setIsOtpSent(false);
      } else {
        toast.error(
          error.response?.data?.message || "OTP verification failed."
        );
        setErrors({ ...errors, email: error.response?.data?.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (element, index) => {
    if (element.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        element.target.previousSibling.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pasteData)) return; // Only allow digits

    const updatedOTP = [...otp];
    for (let i = 0; i < otp.length; i++) {
      if (i < pasteData.length) {
        updatedOTP[i] = pasteData[i];
      }
    }
    setOtp(updatedOTP);
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!loginDetails.password) {
      setErrors({ password: "Password is required." });
      return;
    }
    if (loginDetails.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    try {
      await updatePassword({
        resetToken: Cookies.get("resetToken"),
        newPassword: loginDetails.password,
      });

      if (Cookies.get("resetToken")) {
        Cookies.remove("resetToken");
      }

      toast.success("Password updated successfully!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Reset Password Error:", error);
      if (error.response?.status === 403) {
        toast.error("Session expired. Please restart the process.");
        setIsOtpSent(false);
        setIsOtpVerified(false);
      } else {
        toast.error(
          error.response?.data?.message || "Error resetting password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box auth-password-card">
      {!isOtpSent ? (
        <form onSubmit={handleSendOtp} className="auth-form-panel">
          <h2 className="auth-card-title">Reset password</h2>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={loginDetails.email}
            onChange={handleChange}
            className={`auth-input ${errors.email ? "error-border" : ""}`}
          />
          {errors.email && <p className="auth-error">{errors.email}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Get OTP"}
          </button>
        </form>
      ) : !isOtpVerified ? (
        <div className="auth-form-panel">
          <h2 className="auth-card-title">Verify OTP</h2>
          <p className="otp-heading-text">Enter OTP sent to your email</p>
          <div className="otp-container">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleOTPChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e)}
                className="otp-box-input"
              />
            ))}
          </div>
          {errors.email && <p className="auth-error">{errors.email}</p>}
          <button
            onClick={handleVerifyOtp}
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      ) : (
        <div className="auth-form-panel">
          <h2 className="auth-card-title">Set new password</h2>
          <input
            type="password"
            name="password"
            placeholder="Enter new password"
            value={loginDetails.password}
            onChange={handleChange}
            className={`auth-input ${errors.password ? "error-border" : ""}`}
          />
          {errors.password && <p className="auth-error">{errors.password}</p>}
          <button
            onClick={handleResetPassword}
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordUpdate;
