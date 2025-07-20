import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, Search, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
export const SupportCards = () => {
  const supportOptions = [{
    icon: MessageSquare,
    title: 'Submit a Ticket',
    description: 'Get personalized help from our support team',
    action: 'Create Ticket',
    color: 'bg-primary',
    href: '/support/new'
  }, {
    icon: Search,
    title: 'Browse FAQ',
    description: 'Find quick answers to common questions',
    action: 'View FAQ',
    color: 'bg-info',
    href: '/faq'
  }, {
    icon: FileText,
    title: 'Track Your Tickets',
    description: 'Check the status of your existing requests',
    action: 'View Tickets',
    color: 'bg-warning',
    href: '/tickets'
  }, {
    icon: Phone,
    title: 'Emergency Support',
    description: 'For urgent issues requiring immediate attention',
    action: 'Call Now',
    color: 'bg-destructive',
    href: 'tel:+1-800-MOTORISE'
  }];
  return <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in my-0">
          
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportOptions.map((option, index) => <Card key={index} className="card-electric card-hover group cursor-pointer border-0">
              
              
            </Card>)}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center">
          <div className="bg-[var(--gradient-card)] rounded-2xl p-8 shadow-[var(--shadow-card)] my-0 mx-0 px-[33px]">
            <h3 className="text-2xl font-bold text-navy mb-6 mx-[23px] my-0 py-[20px]">Need More Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">support@motorise.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">1-800-MOTORISE</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Mon-Fri 8AM-8PM EST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};