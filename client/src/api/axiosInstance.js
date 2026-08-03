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
    const token = Cookies.get("jwtToken");

    // Allow these public routes without token
    const publicRoutes = ["/login", "/register", "/send-otp", "/verify-otp"];

    if (token && !publicRoutes.includes(config.url)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default axiosInstance;