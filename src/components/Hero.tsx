import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Headphones, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-scooter.jpg';
export const Hero = () => {
  console.log('Hero component rendered');
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const handleGetSupport = () => {
    console.log('Get Support button clicked, navigating to /login');
    navigate('/login');
  };
  return <section className="relative flex items-center justify-center bg-[var(--gradient-card)] overflow-hidden min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Content */}
          <div className="space-y-4 sm:space-y-6 fade-in">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-tight">
                Need Help?
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Get instant support from our expert team. Submit tickets, track issues, and get back on the road faster with MotoRise Support.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="btn-electric text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6" onClick={handleGetSupport} style={{
              pointerEvents: 'auto',
              zIndex: 10
            }}>
                {user ? user.role === 'admin' ? 'Go to Dashboard' : 'Start Chat' : 'Get Support Now'}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-3 sm:pt-4">
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
          <div className="relative slide-up mt-6 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-elevation)]">
              <img src={heroImage} alt="MotoRise Electric Scooter" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-10"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-xl shadow-[var(--shadow-card)] p-3 sm:p-4 card-hover">
              <div className="text-xl sm:text-2xl font-bold text-primary">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Uptime</div>
            </div>
            
          </div>
        </div>
      </div>
    </section>;
};