import axios from "axios";
import { baseUrl } from "../Config/env";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      Cookies.get("teamflowToken") ||
      Cookies.get("jwtToken") ||
      Cookies.get("token");

    const publicRoutes = [
      "/login",
      "/register",
      "/send-otp",
      "/verify-otp",
      "/send-reset-otp",
      "/verify-reset-otp",
    ];

    const requestPath = typeof config?.url === "string" ? config.url : "";

    if (token && !publicRoutes.some((route) => requestPath.includes(route))) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
