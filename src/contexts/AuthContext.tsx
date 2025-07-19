import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  phone: string;
  role: 'admin' | 'customer';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin numbers
const ADMIN_NUMBERS = ["+919999999999", "+918888888888"];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app start
    const storedUser = localStorage.getItem('motorise_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, otp: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine role based on phone number
    const role = ADMIN_NUMBERS.includes(phone) ? 'admin' : 'customer';
    
    // Create user object
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      role,
      name: role === 'admin' ? 'Admin User' : 'Customer User'
    };
    
    // Store user
    setUser(newUser);
    localStorage.setItem('motorise_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('motorise_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};