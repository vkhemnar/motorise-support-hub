import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Search,
  Filter,
  File,
  AlertCircle,
  CheckCircle,
  Phone,
  Calendar,
  User,
  Bot
} from 'lucide-react';

interface ChatMessage {
  id: string;
  user_phone: string;
  question: string;
  bot_response: string | null;
  file_url: string | null;
  is_unsatisfied: boolean;
  resolved: boolean;
  created_at: string;
}

export const AdminDashboard = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { toast } = useToast();

  // Load all chats
  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
      setFilteredChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chat logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter chats based on search and filter criteria
  const filterChats = () => {
    let filtered = [...chats];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chat.bot_response && chat.bot_response.toLowerCase().includes(searchTerm.toLowerCase())) ||
        chat.user_phone.includes(searchTerm)
      );
    }

    // Phone filter
    if (phoneFilter) {
      filtered = filtered.filter(chat => 
        chat.user_phone.includes(phoneFilter)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'unsatisfied':
          filtered = filtered.filter(chat => chat.is_unsatisfied);
          break;
        case 'resolved':
          filtered = filtered.filter(chat => chat.resolved);
          break;
        case 'unresolved':
          filtered = filtered.filter(chat => !chat.resolved);
          break;
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(chat => new Date(chat.created_at) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(chat => new Date(chat.created_at) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(chat => new Date(chat.created_at) >= filterDate);
          break;
      }
    }

    setFilteredChats(filtered);
  };

  // Mark ticket as resolved
  const markAsResolved = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ resolved: true })
        .eq('id', chatId);

      if (error) throw error;

      // Update local state
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId ? { ...chat, resolved: true } : chat
        )
      );

      toast({
        title: "Success",
        description: "Ticket marked as resolved.",
      });
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: "Error",
        description: "Failed to mark ticket as resolved. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if file is an image
  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // Get filename from URL
  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    filterChats();
  }, [searchTerm, phoneFilter, statusFilter, dateFilter, chats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalChats = chats.length;
  const unsatisfiedChats = chats.filter(chat => chat.is_unsatisfied).length;
  const resolvedChats = chats.filter(chat => chat.resolved).length;
  const uniqueUsers = new Set(chats.map(chat => chat.user_phone)).size;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage customer support and monitor chat logs</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                  <p className="text-2xl font-bold">{totalChats}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                  <p className="text-2xl font-bold">{uniqueUsers}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unsatisfied</p>
                  <p className="text-2xl font-bold text-red-600">{unsatisfiedChats}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedChats}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                placeholder="Filter by phone number..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unsatisfied">Unsatisfied Only</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Chat Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Logs ({filteredChats.length})</CardTitle>
            <CardDescription>Customer support conversations and escalations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No chat logs found matching your criteria.
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div key={chat.id} className="border rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{chat.user_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(chat.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {chat.is_unsatisfied && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unsatisfied
                          </Badge>
                        )}
                        {chat.resolved ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => markAsResolved(chat.id)}
                            className="h-7"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Customer Question:</p>
                          <p className="text-sm">{chat.question}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bot Response */}
                    {chat.bot_response && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Bot className="h-4 w-4 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Bot Response:</p>
                            <p className="text-sm">{chat.bot_response}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    {chat.file_url && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Attached File:</span>
                          {isImageFile(chat.file_url) ? (
                            <div className="mt-2">
                              <img 
                                src={chat.file_url} 
                                alt="Uploaded file" 
                                className="max-w-xs h-auto rounded border"
                                style={{ maxHeight: '150px' }}
                              />
                            </div>
                          ) : (
                            <a
                              href={chat.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                              {getFileName(chat.file_url)}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};