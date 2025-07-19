import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  // Mock ticket data
  const tickets = [
    {
      id: 'TK001',
      customer: 'John Doe',
      phone: '+919876543210',
      issue: 'Battery not charging properly',
      status: 'open',
      priority: 'high',
      createdAt: '2 hours ago'
    },
    {
      id: 'TK002',
      customer: 'Jane Smith',
      phone: '+919876543211',
      issue: 'Brake adjustment needed',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '4 hours ago'
    },
    {
      id: 'TK003',
      customer: 'Mike Johnson',
      phone: '+919876543212',
      issue: 'Speed controller issue',
      status: 'resolved',
      priority: 'high',
      createdAt: '1 day ago'
    }
  ];

  const stats = [
    {
      title: 'Total Tickets',
      value: '156',
      change: '+12%',
      icon: MessageSquare,
      color: 'text-primary'
    },
    {
      title: 'Active Customers',
      value: '89',
      change: '+5%',
      icon: Users,
      color: 'text-success'
    },
    {
      title: 'Avg. Response Time',
      value: '4.2 min',
      change: '-8%',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'Resolution Rate',
      value: '94%',
      change: '+2%',
      icon: TrendingUp,
      color: 'text-success'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage customer support and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-electric card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-navy">{stat.value}</p>
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tickets */}
        <Card className="card-electric">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-navy">Recent Tickets</CardTitle>
                <CardDescription>Latest customer support requests</CardDescription>
              </div>
              <Button className="btn-electric">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-navy">{ticket.customer}</p>
                      <p className="text-sm text-muted-foreground">{ticket.phone}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{ticket.issue}</p>
                      <p className="text-xs text-muted-foreground">{ticket.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={ticket.priority === 'high' ? 'priority' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={ticket.status as any}>
                      {ticket.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};