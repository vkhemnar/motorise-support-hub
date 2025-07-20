import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTickets } from '@/hooks/useTickets';
import { format } from 'date-fns';

export const MyTickets = () => {
  const { tickets, ticketResponses, loading, loadTicketResponses } = useTickets();

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
            When you mark a chat response as unsatisfied, a ticket will be created here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold">My Tickets</h2>
      
      {tickets.map((ticket) => {
        const responses = ticketResponses[ticket.id] || [];
        
        return (
          <Card key={ticket.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base sm:text-lg break-words">{ticket.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Created {format(new Date(ticket.created_at), 'MMM dd, yyyy at HH:mm')}
                  </p>
                </div>
                <Badge className={`${getStatusColor(ticket.status)} text-xs flex-shrink-0`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Original Question */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Original Question:</h4>
                <p className="text-xs sm:text-sm break-words">{ticket.chat?.question}</p>
              </div>
              
              {/* Bot Response */}
              {ticket.chat?.bot_response && (
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Bot Response:</h4>
                  <p className="text-xs sm:text-sm break-words">{ticket.chat.bot_response}</p>
                </div>
              )}
              
              {/* Admin Responses */}
              {responses.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Support Responses:</h4>
                    {responses.map((response) => (
                      <div key={response.id} className="bg-muted/50 p-2 sm:p-3 rounded-md space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs text-muted-foreground">Support Team</span>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};