import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Headphones, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-scooter.jpg';

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetSupport = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/chat');
    } else {
      navigate('/login');
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[var(--gradient-card)] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight">
                Need Help with Your 
                <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent"> Electric Scooter</span>?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get instant support from our expert team. Submit tickets, track issues, and get back on the road faster with MotoRise Support.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-electric text-lg px-8 py-6" onClick={handleGetSupport}>
                {user ? (user.role === 'admin' ? 'Go to Dashboard' : 'Start Chat') : 'Get Support Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 btn-outline-electric">
                Browse FAQ
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-navy">24/7 Support</div>
                  <div className="text-sm text-muted-foreground">Always available</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-navy">Live Chat</div>
                  <div className="text-sm text-muted-foreground">Instant responses</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-navy">Expert Help</div>
                  <div className="text-sm text-muted-foreground">Certified technicians</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-elevation)]">
              <img
                src={heroImage}
                alt="MotoRise Electric Scooter"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-10"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-[var(--shadow-card)] p-4 card-hover">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-[var(--shadow-card)] p-4 card-hover">
              <div className="text-2xl font-bold text-accent">5 min</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};