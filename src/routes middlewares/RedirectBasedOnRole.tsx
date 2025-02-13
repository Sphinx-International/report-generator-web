import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectBasedOnRole: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the user role from local storage
    const role = parseInt(localStorage.getItem('role') || '0', 10); // Default to 0 if not found

    if (role === 0) {
      navigate('/users');
    } else if (role === 1 || role === 2 || role === 3) {
      navigate('/workorders');
    }
  }, [navigate]);

  // Optionally, you can render a loading spinner or message while redirecting
  return <div>Redirecting...</div>;
};

export default RedirectBasedOnRole;
