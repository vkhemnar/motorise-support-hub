import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  user_phone: string;
  question: string;
  bot_response: string | null;
  file_url: string | null;
  is_unsatisfied: boolean;
  resolved: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  response: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history
  useEffect(() => {
    if (user?.phone) {
      loadChatHistory();
    }
  }, [user?.phone]);

  const loadChatHistory = async () => {
    if (!user?.phone) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_phone', user.phone)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchFAQs = async (question: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*');

      if (error) throw error;

      // Simple search - find FAQ with most matching keywords
      const searchTerms = question.toLowerCase().split(' ').filter(term => term.length > 2);
      let bestMatch: FAQ | null = null;
      let bestScore = 0;

      data?.forEach((faq) => {
        const faqText = (faq.question + ' ' + faq.response).toLowerCase();
        const score = searchTerms.reduce((acc, term) => {
          return acc + (faqText.includes(term) ? 1 : 0);
        }, 0);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = faq;
        }
      });

      if (bestMatch && bestScore > 0) {
        return bestMatch.response;
      }

      // Default response if no match found
      return "Thank you for contacting MotoRise support. I'm here to help with any issues you're experiencing with your electric scooter. Could you please provide more details about the problem? Our support team will get back to you shortly.";
    } catch (error) {
      console.error('Error searching FAQs:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team directly.";
    }
  };

  const sendMessage = async (question: string): Promise<void> => {
    if (!user?.phone || !question.trim()) return;

    setIsTyping(true);

    try {
      // Search for bot response
      const botResponse = await searchFAQs(question);

      // Save to database
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            user_phone: user.phone,
            question: question.trim(),
            bot_response: botResponse,
            is_unsatisfied: false,
            resolved: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  const markAsUnsatisfied = async (chatId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ is_unsatisfied: true })
        .eq('id', chatId);

      if (error) throw error;

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === chatId ? { ...msg, is_unsatisfied: true } : msg
        )
      );

      // Also add to unsatisfied_queries table
      const chat = messages.find(m => m.id === chatId);
      if (chat) {
        await supabase
          .from('unsatisfied_queries')
          .insert([
            {
              chat_id: chatId,
              user_phone: chat.user_phone,
              file_url: chat.file_url,
            }
          ]);
      }
    } catch (error) {
      console.error('Error marking as unsatisfied:', error);
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    markAsUnsatisfied,
    loadChatHistory,
  };
};