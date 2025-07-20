import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, Search, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';

export const SupportCards = () => {
  const supportOptions = [
    {
      icon: MessageSquare,
      title: 'Submit a Ticket',
      description: 'Get personalized help from our support team',
      action: 'Create Ticket',
      color: 'bg-primary',
      href: '/support/new'
    },
    {
      icon: Search,
      title: 'Browse FAQ',
      description: 'Find quick answers to common questions',
      action: 'View FAQ',
      color: 'bg-info',
      href: '/faq'
    },
    {
      icon: FileText,
      title: 'Track Your Tickets',
      description: 'Check the status of your existing requests',
      action: 'View Tickets',
      color: 'bg-warning',
      href: '/tickets'
    },
    {
      icon: Phone,
      title: 'Emergency Support',
      description: 'For urgent issues requiring immediate attention',
      action: 'Call Now',
      color: 'bg-destructive',
      href: 'tel:+1-800-MOTORISE'
    }
  ];

  return (
    <section className="bg-background py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 sm:mb-4">
            How Can We Help You?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our comprehensive support options to get the help you need
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {supportOptions.map((option, index) => (
            <Card key={index} className="card-electric card-hover group cursor-pointer border-0 h-full">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${option.color} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <option.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-navy group-hover:text-primary transition-colors">
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3 sm:space-y-4">
                <CardDescription className="text-sm sm:text-base text-muted-foreground">
                  {option.description}
                </CardDescription>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-200">
                  {option.action}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center">
          <div className="bg-[var(--gradient-card)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <h3 className="text-xl sm:text-2xl font-bold text-navy mb-4 sm:mb-6">Need More Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-muted-foreground">support@motorise.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-muted-foreground">1-800-MOTORISE</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-muted-foreground">Mon-Fri 8AM-8PM EST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};