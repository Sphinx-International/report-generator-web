import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getRole } from '../func/getUserRole';
const baseUrl = import.meta.env.VITE_BASE_URL;


interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = getRole();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${baseUrl}/account/test-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          });

          if (response.status === 202) {
            setIsValid(true); 
          } else if (response.status === 401) {
            // Token is invalid, clear storage and navigate to login
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });

          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.clear();
          sessionStorage.clear();
          navigate('/', { replace: true });
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
    return <Navigate to="/missions" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
