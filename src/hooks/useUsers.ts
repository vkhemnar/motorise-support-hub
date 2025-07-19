import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupabaseUser {
  phone_number: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export const useUsers = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createOrUpdateUser = async (phoneNumber: string, role: 'admin' | 'customer'): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            phone_number: phoneNumber,
            role: role,
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserByPhone = async (phoneNumber: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  };

  return {
    isLoading,
    createOrUpdateUser,
    getUserByPhone,
  };
};