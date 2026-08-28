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
        

        const allowedNames = new Set(
          resources.flatMap((r) => [
            String(r.name || "").toLowerCase(),
            String(r.resource_key || "").toLowerCase(),
          ])
        );

        const currentPath = location.pathname.toLowerCase();

        const routeToResource = {
          "/dashboard": ["dashboard"],
          "/dashboard/projects": ["projects"],
          "/dashboard/reports": ["reports", "all_reports"],
          "/dashboard/settings": ["settings", "users", "user_management", "resources", "positions"],
          "/dashboard/work": ["work"],
          "/dashboard/status": ["status"],
          "/dashboard/teams": ["teams"],
          "/dashboard/resources": ["resources"],
          "/dashboard/positions": ["positions"],
          "/team-overview": ["teams"],
          "/performance": ["reports", "all_reports"]
        };

        const resourceNames = routeToResource[currentPath] || [];

        if (resourceNames.length > 0 && !resourceNames.some((name) => allowedNames.has(name))) {
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
