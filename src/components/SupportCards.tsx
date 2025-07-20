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
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4 mx-0 px-0 my-px py-0">
            How Can We Help You Today?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the support option that best fits your needs. Our team is here to get you back on the road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportOptions.map((option, index) => <Card key={index} className="card-electric card-hover group cursor-pointer border-0">
              
              
            </Card>)}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center">
          <div className="bg-[var(--gradient-card)] rounded-2xl p-8 shadow-[var(--shadow-card)]">
            <h3 className="text-2xl font-bold text-navy mb-6 my-0">Need More Help?</h3>
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