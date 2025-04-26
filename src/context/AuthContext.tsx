import React, { createContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextState {
  isAuthenticate: boolean;
  setIsAuthenticate: (val: boolean) => void;
  token: string;
  setToken: (val: string) => void;
  user: any;
  setUser: (val: any) => void;
  login: (formData: any) => Promise<void>;
  gmail_login: (data: any) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextState | null>(null);

interface AuthContextProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProps> = ({ children }) => {
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // 🔄 Load token & verify on page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      console.log(storedToken)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      axios
        .get('/api2/auth/verify') // Your backend route to validate token
        .then((res) => {
          setToken(res.data.token);
          setUser(res.data.user);
          setIsAuthenticate(true);
          localStorage.setItem('auth_token', res.data.token);
        })
        .catch(() => {
          logout(); // If token invalid
        });
    }
  }, []);

  const login = async (formData: any) => {
    try {
      const res = await axios.post('/api2/auth/login', formData);
      const { token, user } = res.data;

      setToken(token);
      setUser(user);
      setIsAuthenticate(true);
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  const gmail_login = async (data: any) => {
    try{
      const { token, user } = data;
      setToken(token);
      setUser(user);
      setIsAuthenticate(true);
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  }

  const register = async (formData: any) => {
    try {
      const res = await axios.post('/api2/auth/register', formData);
      console.log('Registered:', res.data);
      await login({ email: formData.email, password: formData.password });
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setIsAuthenticate(false);
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticate,
        setIsAuthenticate,
        token,
        setToken,
        user,
        setUser,
        login,
        gmail_login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
