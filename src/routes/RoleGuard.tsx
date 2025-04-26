import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // adjust path as needed

interface RoleGuardProps {
  role: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ role, children }) => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user, isAuthenticate } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticate) {
      navigate('/auth/login');
    } else if (user && !role.includes(user.role)) {
      navigate('/');
    }
  }, [user, isAuthenticate, role, navigate]);

  if (!isAuthenticate || !user) return null; // or a loading indicator

  return role.includes(user.role) ? <>{children}</> : null;
};

export default RoleGuard;
