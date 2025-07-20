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
    console.log('CreateOrUpdateUser called with:', { phoneNumber, role });
    
    if (!phoneNumber || !role) {
      console.error('Invalid parameters for createOrUpdateUser:', { phoneNumber, role });
      throw new Error('Phone number and role are required');
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to upsert user to Supabase...');
      const { data, error } = await supabase
        .from('users')
        .upsert([
          {
            phone_number: phoneNumber,
            role: role,
          }
        ], {
          onConflict: 'phone_number'
        })
        .select();

      if (error) {
        console.error('Supabase error in createOrUpdateUser:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          phoneNumber,
          role
        });
        throw error;
      }
      console.log('User created/updated successfully:', data);
    } catch (error) {
      console.error('Caught error in createOrUpdateUser:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        phoneNumber,
        role
      });
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