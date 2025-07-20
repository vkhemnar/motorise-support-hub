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
      const response = await supabase
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

      console.log('Raw Supabase response:', response);

      if (response.error) {
        console.error('Supabase error in createOrUpdateUser:', {
          error: response.error,
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint,
          code: response.error.code,
          phoneNumber,
          role
        });
        throw new Error(`Failed to create/update user: ${response.error.message}`);
      }

      if (!response.data) {
        console.error('No data returned from Supabase');
        throw new Error('No data returned from user creation');
      }

      console.log('User created/updated successfully:', response.data);
    } catch (error) {
      console.error('Caught error in createOrUpdateUser:', {
        error,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        phoneNumber,
        role
      });
      
      // Re-throw with a more descriptive message
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
      }
      
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