import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRole } from '../func/getUserRole';

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = getRole();

  if (!token ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!allowedRoles.includes(userRole!)) {
    return <Navigate to="/missions" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
