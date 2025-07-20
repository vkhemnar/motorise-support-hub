import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTickets } from '@/hooks/useTickets';
import { format } from 'date-fns';
import { Upload, Send } from 'lucide-react';

export const AdminTickets = () => {
  const { tickets, ticketResponses, loading, loadTicketResponses, updateTicketStatus, respondToTicket } = useTickets();
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    // Load responses for all tickets
    tickets.forEach(ticket => {
      if (!ticketResponses[ticket.id]) {
        loadTicketResponses(ticket.id);
      }
    });
  }, [tickets, ticketResponses, loadTicketResponses]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusChange = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    updateTicketStatus(ticketId, status);
  };

  const handleFileSelect = (ticketId: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [ticketId]: file }));
  };

  const handleSendResponse = async (ticketId: string) => {
    const responseText = responseTexts[ticketId]?.trim();
    const file = selectedFiles[ticketId];
    
    if (!responseText && !file) return;

    await respondToTicket(ticketId, responseText, file || undefined);
    
    // Clear form
    setResponseTexts(prev => ({ ...prev, [ticketId]: '' }));
    setSelectedFiles(prev => ({ ...prev, [ticketId]: null }));
  };

  const toggleTicketExpansion = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Customer tickets will appear here when they mark responses as unsatisfied.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Support Tickets</h2>
      
      {tickets.map((ticket) => {
        const responses = ticketResponses[ticket.id] || [];
        const isExpanded = expandedTicket === ticket.id;
        
        return (
          <Card key={ticket.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg cursor-pointer hover:text-primary" 
                           onClick={() => toggleTicketExpansion(ticket.id)}>
                    {ticket.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customer: {ticket.user_phone} • Created {format(new Date(ticket.created_at), 'MMM dd, yyyy at HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={ticket.status} onValueChange={(value: any) => handleStatusChange(ticket.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="space-y-4">
                {/* Original Question */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Original Question:</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-md">{ticket.chat?.question}</p>
                </div>
                
                {/* Bot Response */}
                {ticket.chat?.bot_response && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Bot Response:</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-md">{ticket.chat.bot_response}</p>
                  </div>
                )}
                
                {/* Previous Responses */}
                {responses.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Previous Responses:</h4>
                      {responses.map((response) => (
                        <div key={response.id} className="bg-primary/5 p-3 rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Admin: {response.admin_phone}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(response.created_at), 'MMM dd, yyyy at HH:mm')}
                            </span>
                          </div>
                          
                          {response.response_text && (
                            <p className="text-sm">{response.response_text}</p>
                          )}
                          
                          {response.response_file_url && (
                            <div className="mt-2">
                              <a 
                                href={response.response_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Response Form */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Send Response:</h4>
                  
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseTexts[ticket.id] || ''}
                    onChange={(e) => setResponseTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(ticket.id, e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSendResponse(ticket.id)}
                      disabled={!responseTexts[ticket.id]?.trim() && !selectedFiles[ticket.id]}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Response
                    </Button>
                  </div>
                  
                  {selectedFiles[ticket.id] && (
                    <p className="text-xs text-muted-foreground">
                      Selected file: {selectedFiles[ticket.id]?.name}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};