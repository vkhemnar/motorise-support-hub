import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Ticket {
  id: string;
  chat_id: string;
  user_phone: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  chat?: {
    question: string;
    bot_response: string;
    file_url: string | null;
  };
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  admin_phone: string;
  response_text: string | null;
  response_file_url: string | null;
  created_at: string;
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketResponses, setTicketResponses] = useState<Record<string, TicketResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTickets = async () => {
    if (!user?.phone) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          chat:chats(question, bot_response, file_url)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show user's own tickets
      if (user.role !== 'admin') {
        query = query.eq('user_phone', user.phone);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load tickets",
          variant: "destructive",
        });
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTicketResponses = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading ticket responses:', error);
        return;
      }

      setTicketResponses(prev => ({
        ...prev,
        [ticketId]: data || []
      }));
    } catch (error) {
      console.error('Error loading ticket responses:', error);
    }
  };

  const createTicket = async (chatId: string, userPhone: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          chat_id: chatId,
          user_phone: userPhone,
          title: title
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to create ticket",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Ticket Created",
        description: "Your ticket has been created and will be reviewed by our team.",
      });

      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket status:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket status",
          variant: "destructive",
        });
        return;
      }

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status } : ticket
      ));

      toast({
        title: "Status Updated",
        description: "Ticket status has been updated",
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const uploadResponseFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `ticket_responses/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('chat_uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const respondToTicket = async (ticketId: string, responseText?: string, file?: File) => {
    if (!user?.phone || (!responseText && !file)) return;

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadResponseFile(file);
        if (!fileUrl) {
          toast({
            title: "Error",
            description: "Failed to upload file",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          admin_phone: user.phone,
          response_text: responseText || null,
          response_file_url: fileUrl
        });

      if (error) {
        console.error('Error responding to ticket:', error);
        toast({
          title: "Error",
          description: "Failed to send response",
          variant: "destructive",
        });
        return;
      }

      // Update ticket status to in_progress if it was open
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket?.status === 'open') {
        await updateTicketStatus(ticketId, 'in_progress');
      }

      // Reload responses for this ticket
      await loadTicketResponses(ticketId);

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the customer",
      });
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.phone) {
      loadTickets();
    }
  }, [user?.phone]);

  return {
    tickets,
    ticketResponses,
    loading,
    loadTickets,
    loadTicketResponses,
    createTicket,
    updateTicketStatus,
    respondToTicket
  };
};