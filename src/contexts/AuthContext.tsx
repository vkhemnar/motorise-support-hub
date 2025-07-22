import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';

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
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in database
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('phone_number, role')
        .eq('phone_number', phone)
        .single();

      let role: 'admin' | 'customer' = 'customer';

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create new customer
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ phone_number: phone, role: 'customer' }]);
        
        if (insertError) {
          throw new Error('Failed to create user account');
        }
        role = 'customer';
      } else if (existingUser) {
        // User exists, use their role from database
        role = existingUser.role;
      } else if (error) {
        throw new Error('Failed to check user account');
      }
      
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
    } finally {
      setIsLoading(false);
    }
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