import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminTickets } from '@/components/AdminTickets';
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
  Bot,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  Package,
  Upload,
  Download,
  Ticket
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

interface FAQ {
  id: string;
  question: string;
  response: string;
}

interface Order {
  id: string;
  order_id: string;
  phone_number: string;
  product: string;
  status: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatMessage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqLoading, setFaqLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('chats');
  
  // FAQ management state
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [isEditFaqOpen, setIsEditFaqOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqResponse, setNewFaqResponse] = useState('');

  // Order management state
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderProduct, setNewOrderProduct] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('Pending');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  
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

  // Load FAQs
  const loadFaqs = async () => {
    setFaqLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('question', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFaqLoading(false);
    }
  };

  // Add new FAQ
  const addFaq = async () => {
    if (!newFaqQuestion.trim() || !newFaqResponse.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and response.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .insert([
          {
            question: newFaqQuestion.trim(),
            response: newFaqResponse.trim()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ added successfully."
      });

      setNewFaqQuestion('');
      setNewFaqResponse('');
      setIsAddFaqOpen(false);
      loadFaqs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to add FAQ. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update FAQ
  const updateFaq = async () => {
    if (!editingFaq || !editingFaq.question.trim() || !editingFaq.response.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and response.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .update({
          question: editingFaq.question.trim(),
          response: editingFaq.response.trim()
        })
        .eq('id', editingFaq.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ updated successfully."
      });

      setEditingFaq(null);
      setIsEditFaqOpen(false);
      loadFaqs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to update FAQ. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete FAQ
  const deleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ deleted successfully."
      });

      loadFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load Orders
  const loadOrders = async () => {
    setOrderLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOrderLoading(false);
    }
  };

  // Add new order
  const addOrder = async () => {
    if (!newOrderId.trim() || !newOrderPhone.trim() || !newOrderProduct.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            order_id: newOrderId.trim(),
            phone_number: newOrderPhone.trim(),
            product: newOrderProduct.trim(),
            status: newOrderStatus
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order added successfully."
      });

      setNewOrderId('');
      setNewOrderPhone('');
      setNewOrderProduct('');
      setNewOrderStatus('Pending');
      setIsAddOrderOpen(false);
      loadOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "Failed to add order. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Parse and upload CSV
  const uploadCsv = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingCsv(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row.');
      }

      // Parse CSV (expecting: Order ID, Phone Number, Product, Status)
      const orders = [];
      const header = lines[0].toLowerCase();
      
      // Check if header contains required columns
      if (!header.includes('order') || !header.includes('phone') || !header.includes('product')) {
        throw new Error('CSV must contain columns for Order ID, Phone Number, and Product.');
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length >= 3 && values[0] && values[1] && values[2]) {
          orders.push({
            order_id: values[0],
            phone_number: values[1],
            product: values[2],
            status: values[3] || 'Pending'
          });
        }
      }

      if (orders.length === 0) {
        throw new Error('No valid orders found in CSV file.');
      }

      const { error } = await supabase
        .from('orders')
        .insert(orders);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully uploaded ${orders.length} orders.`
      });

      setCsvFile(null);
      loadOrders();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload CSV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // Generate CSV template
  const downloadCsvTemplate = () => {
    const csvContent = "Order ID,Phone Number,Product,Status\nORD12345,1234567890,Electric Scooter Model X,Pending\nORD12346,9876543210,Helmet - Black,Shipped";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    console.log('AdminDashboard mounted, loading data...');
    loadChats();
    loadFaqs();
    loadOrders();
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
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage customer support and monitor chat logs</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
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

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-0.5 sm:gap-1 h-auto py-2 sm:py-1">
            <TabsTrigger value="chats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-3 sm:py-2">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Chat Logs</span>
              <span className="sm:hidden truncate">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-3 sm:py-2">
              <Ticket className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-3 sm:py-2">
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">FAQ Manager</span>
              <span className="sm:hidden truncate">FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-3 sm:py-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Manage Orders</span>
              <span className="sm:hidden truncate">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Logs Tab */}
          <TabsContent value="chats" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
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
                <CardTitle className="text-lg sm:text-xl">Chat Logs ({filteredChats.length})</CardTitle>
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium break-all">{chat.user_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                {formatDate(chat.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {chat.is_unsatisfied && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="hidden sm:inline">Unsatisfied</span>
                                <span className="sm:hidden">Bad</span>
                              </Badge>
                            )}
                            {chat.resolved ? (
                              <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="hidden sm:inline">Resolved</span>
                                <span className="sm:hidden">Done</span>
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => markAsResolved(chat.id)}
                                className="h-7 text-xs px-2 sm:px-3"
                              >
                                <span className="hidden sm:inline">Mark Resolved</span>
                                <span className="sm:hidden">Resolve</span>
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
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <AdminTickets />
          </TabsContent>

          {/* FAQ Manager Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <HelpCircle className="h-5 w-5" />
                      FAQ Management
                    </CardTitle>
                    <CardDescription>Manage frequently asked questions for the chatbot</CardDescription>
                  </div>
                  
                  <Dialog open={isAddFaqOpen} onOpenChange={setIsAddFaqOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Add FAQ</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Add New FAQ</DialogTitle>
                        <DialogDescription>
                          Create a new frequently asked question and response for the chatbot.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Question</label>
                          <Input
                            placeholder="Enter the question..."
                            value={newFaqQuestion}
                            onChange={(e) => setNewFaqQuestion(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Response</label>
                          <Textarea
                            placeholder="Enter the response..."
                            value={newFaqResponse}
                            onChange={(e) => setNewFaqResponse(e.target.value)}
                            rows={6}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddFaqOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addFaq}>
                          <Save className="h-4 w-4 mr-2" />
                          Save FAQ
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {faqLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading FAQs...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faqs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No FAQs found. Click "Add FAQ" to create your first one.
                      </div>
                    ) : (
                      faqs.map((faq) => (
                        <div key={faq.id} className="border rounded-lg overflow-hidden">
                          {/* Header with Question and Action Buttons */}
                          <div className="flex items-start justify-between p-4 border-b">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-muted-foreground">Question:</h4>
                              <p className="font-medium">{faq.question}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Dialog open={isEditFaqOpen && editingFaq?.id === faq.id} onOpenChange={(open) => {
                                setIsEditFaqOpen(open);
                                if (!open) setEditingFaq(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingFaq({ ...faq })}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit FAQ</DialogTitle>
                                    <DialogDescription>
                                      Update the question and response for this FAQ.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingFaq && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Question</label>
                                        <Input
                                          value={editingFaq.question}
                                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Response</label>
                                        <Textarea
                                          value={editingFaq.response}
                                          onChange={(e) => setEditingFaq({ ...editingFaq, response: e.target.value })}
                                          rows={6}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setIsEditFaqOpen(false);
                                      setEditingFaq(null);
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button onClick={updateFaq}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Update FAQ
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteFaq(faq.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Response section covering full area */}
                          <div className="bg-primary/5 p-4">
                            <div className="flex items-start gap-2">
                              <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium mb-1">Response:</p>
                                <div className="text-sm whitespace-pre-wrap break-words">{faq.response}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manual Order Entry */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Plus className="h-5 w-5" />
                        Add New Order
                      </CardTitle>
                      <CardDescription>Manually enter order details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Order ID *</label>
                      <Input
                        placeholder="e.g., ORD12345"
                        value={newOrderId}
                        onChange={(e) => setNewOrderId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Customer Phone Number *</label>
                      <Input
                        placeholder="e.g., 1234567890"
                        value={newOrderPhone}
                        onChange={(e) => setNewOrderPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Product Name *</label>
                      <Input
                        placeholder="e.g., Electric Scooter Model X"
                        value={newOrderProduct}
                        onChange={(e) => setNewOrderProduct(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Delivery Status</label>
                      <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addOrder} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Add Order
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CSV Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Upload Orders
                  </CardTitle>
                  <CardDescription>Upload multiple orders via CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">CSV File</label>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSV should contain: Order ID, Phone Number, Product, Status
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        onClick={downloadCsvTemplate}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV Template
                      </Button>
                      
                      <Button 
                        onClick={uploadCsv}
                        disabled={!csvFile || isUploadingCsv}
                        className="w-full"
                      >
                        {isUploadingCsv ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Uploading...
                          </div>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CSV
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Order Management ({orders.length})</CardTitle>
                <CardDescription>View and manage all orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orderLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders found. Add your first order using the form above or upload a CSV file.
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium break-all">{order.order_id}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground break-all">{order.phone_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            <Badge 
                              variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Shipped' ? 'secondary' :
                                order.status === 'Cancelled' ? 'destructive' :
                                'outline'
                              }
                              className={`flex-shrink-0 ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                ''
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Product:</p>
                                <p className="text-sm">{order.product}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};