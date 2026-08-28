import axiosInstance from "./axiosInstance";
import Cookies from "js-cookie";

const persistAuthToken = (token) => {
  const options = { expires: 30, sameSite: "Lax" };
  Cookies.set("teamflowToken", token, options);
  Cookies.set("jwtToken", token, options);
  Cookies.set("token", token, options);
};

export const logoutUser = () => {
  Cookies.remove("teamflowToken");
  Cookies.remove("jwtToken");
  Cookies.remove("token");
  localStorage.removeItem("userData");
};

export const loginUser = async (loginDetails, navigate) => {
  try {
    const response = await axiosInstance.post("/login", loginDetails);

    const token = response?.data?.token;
    const userData = response?.data?.user;

    if (!token || !userData) {
      throw new Error("Invalid login response");
    }

    persistAuthToken(token);
    localStorage.setItem("userData", JSON.stringify(userData));

    if (navigate) {
      navigate("/dashboard", { replace: true });
    }

    return response.data;
  } catch (error) {
    console.error(
      "Login Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};



export const getUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user-details/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get User Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};

export const getUsersByRole = async (roleId) => {
  try {
    const response = await axiosInstance.get("/users-by-role/" + roleId);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get User Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};

export const registerUser = async (registerDetails) => {
  try {
    const response = await axiosInstance.post("/register", registerDetails);
    return response.data;
  } catch (error) {
    console.error(
      "Register Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};

export const updatePassword = async (passwordDetails) => {
  const response = await axiosInstance.post(
    "/reset-password",
    passwordDetails
  );
  return response.data;
};

export const sendOtp = (userData) => {
  const { email } = userData;
  if (!email) {
    throw new Error("Email is required to send OTP.");
  }
  return axiosInstance.post("/send-otp", { email });
};

export const sendResetOtp = (email) => {
  if (!email) {
    throw new Error("Email is required to send reset OTP.");
  }
  return axiosInstance.post("/send-reset-otp", { email });
}

export const verifyResetOtp = (email, otp, token) => {
  return axiosInstance.post("/verify-reset-otp", { email, otp, token });
}

export const verifyOtp = (email, otp, token) => {
  return axiosInstance.post("/verify-otp", { email, otp, token });
};

export const resetPassword = (resetToken, newPassword) => {
  return axiosInstance.post("/reset-password", { resetToken, newPassword });
};


export const getResources = async (role) => {
  try {
    const response = await axiosInstance.get('/resources');
    return response.data;
  } catch (error) {
    console.error(
      "Get User Error:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};
