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
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold">Support Tickets</h2>
      
      {tickets.map((ticket) => {
        const responses = ticketResponses[ticket.id] || [];
        const isExpanded = expandedTicket === ticket.id;
        
        return (
          <Card key={ticket.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base sm:text-lg cursor-pointer hover:text-primary break-words" 
                           onClick={() => toggleTicketExpansion(ticket.id)}>
                    {ticket.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Customer: {ticket.user_phone} • Created {format(new Date(ticket.created_at), 'MMM dd, yyyy at HH:mm')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Select value={ticket.status} onValueChange={(value: any) => handleStatusChange(ticket.id, value)}>
                    <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={`${getStatusColor(ticket.status)} text-xs flex-shrink-0`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Original Question */}
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Original Question:</h4>
                  <p className="text-xs sm:text-sm bg-muted/30 p-2 sm:p-3 rounded-md break-words">{ticket.chat?.question}</p>
                  
                  {/* Customer's Attached File */}
                  {ticket.chat?.file_url && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Customer's Attachment:</h5>
                      <a 
                        href={ticket.chat.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs sm:text-sm break-all inline-flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        View Customer's File
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Bot Response */}
                {ticket.chat?.bot_response && (
                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Bot Response:</h4>
                    <p className="text-xs sm:text-sm bg-muted/30 p-2 sm:p-3 rounded-md break-words">{ticket.chat.bot_response}</p>
                  </div>
                )}
                
                {/* Previous Responses */}
                {responses.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Previous Responses:</h4>
                      {responses.map((response) => (
                        <div key={response.id} className="bg-primary/5 p-2 sm:p-3 rounded-md space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs text-muted-foreground">Admin: {response.admin_phone}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(response.created_at), 'MMM dd, yyyy at HH:mm')}
                            </span>
                          </div>
                          
                          {response.response_text && (
                            <p className="text-xs sm:text-sm break-words">{response.response_text}</p>
                          )}
                          
                          {response.response_file_url && (
                            <div className="mt-2">
                              <a 
                                href={response.response_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs sm:text-sm break-all"
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
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Send Response:</h4>
                  
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseTexts[ticket.id] || ''}
                    onChange={(e) => setResponseTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    className="min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(ticket.id, e.target.files?.[0] || null)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={() => handleSendResponse(ticket.id)}
                      disabled={!responseTexts[ticket.id]?.trim() && !selectedFiles[ticket.id]}
                      className="flex items-center gap-2 text-sm h-9 sm:h-10"
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Send Response</span>
                      <span className="sm:hidden">Send</span>
                    </Button>
                  </div>
                  
                  {selectedFiles[ticket.id] && (
                    <p className="text-xs text-muted-foreground break-all">
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