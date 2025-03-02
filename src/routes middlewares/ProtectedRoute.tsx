import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getRole } from "../func/getUserRole";
import Page404 from "../pages/Page404";
import { getUserAccess } from "../func/getAccess";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: number[];
  projectAccess?: 0 | 1 | 2 | 3;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  projectAccess,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userRole = getRole();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${baseUrl}/account/test-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          });

          if (response.status === 202) {
            setIsValid(true);
          } else if (response.status === 401) {
            // Token is invalid, clear storage and navigate to login
            localStorage.clear();
            sessionStorage.clear();
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          localStorage.clear();
          sessionStorage.clear();
          navigate("/", { replace: true });
        }
      } else {
        setIsValid(false); // No token present
      }
    };

    verifyToken();
  }, [token, navigate]);

  if (isValid === null) {
    // Optionally return a loading state while verifying token
    return <div>Loading...</div>;
  }

  if (!token || isValid === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole!)) {
    return <Page404 />;
  }
  // Check if projectAccess is required and the user does not have it
  if (
    projectAccess !== undefined &&
    projectAccess !== null &&
    !getUserAccess().includes(projectAccess)
  ) {
    return <Page404 />;
  }

  return element;
};

export default ProtectedRoute;
