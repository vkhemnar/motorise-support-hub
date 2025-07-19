import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(phone, otp);
      
      // Redirect based on role
      const storedUser = JSON.parse(localStorage.getItem('motorise_user') || '{}');
      if (storedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome ${storedUser.role === 'admin' ? 'Admin' : 'Customer'}!`
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-card)] p-4">
      <Card className="w-full max-w-md card-electric">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-[var(--gradient-primary)] rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            {step === 'phone' ? 'Login to MotoRise' : 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your mobile number to get started'
              : `We've sent a 6-digit code to ${phone}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 9999999999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Admin numbers: +919999999999, +918888888888
                </p>
              </div>
              
              <Button type="submit" className="w-full btn-electric">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Enter OTP</label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter any 6-digit code (this is a demo)
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-electric" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </form>
          )}
          
          <Button 
            variant="ghost" 
            onClick={goBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 'phone' ? 'Back to Home' : 'Change Number'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};