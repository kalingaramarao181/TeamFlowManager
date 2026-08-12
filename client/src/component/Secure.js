import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getResources } from "../api/authApi";
import Loader from "./Loader";

const Secure = () => {
  const token = Cookies.get('teamflowToken') || Cookies.get("jwtToken");
  const location = useLocation();
  const [allowed, setAllowed] = useState(null); // null = loading, false = denied, true = allowed

  useEffect(() => {
    const verifyAccess = async () => {
      if (!token) {
        setAllowed(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          alert("Session expired. Please log in again.");
          Cookies.remove('teamflowToken'); Cookies.remove("jwtToken");
          setAllowed(false);
          return;
        }

        const resources = await getResources();
        console.log(resources);
        

        const allowedNames = new Set(resources.map(r => r.name.toLowerCase()));
        

        const currentPath = location.pathname.toLowerCase();

        const routeToResource = {
          "/dashboard": "dashboard",
          "/dashboard/projects": "projects",
          "/dashboard/reports": "reports",
          "/dashboard/settings": "settings",
          "/dashboard/work": "your work",
          "/dashboard/status": "status",
          "/team-overview": "team overview",
          "/performance": "performance"
        };

        const resourceName = routeToResource[currentPath];

        if (resourceName && !allowedNames.has(resourceName)) {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error("Access verification failed:", error);
        Cookies.remove('teamflowToken'); Cookies.remove("jwtToken");
        setAllowed(false);
      }
    };

    verifyAccess();
  }, [token, location.pathname]);

  if (allowed === null) {
    return <Loader />;
  }

  return allowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default Secure;
