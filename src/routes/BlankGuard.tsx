import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // adjust path as needed

interface BlankGuardProps {
  children: React.ReactNode;
}

const BlankGuard: React.FC<BlankGuardProps> = ({ children }) => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { isAuthenticate } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticate) {
      navigate('/');
    }
  }, [isAuthenticate, navigate]);

  return isAuthenticate ? null : <>{children}</>;
};

export default BlankGuard;
