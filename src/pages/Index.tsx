import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users to their appropriate page
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer') {
        navigate('/chat');
      }
    }
  }, [user, navigate]);

  // Only show home page if user is not logged in
  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen">
      <Hero />
    </div>
  );
};

export default Index;
