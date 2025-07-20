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

  const checkOrderStatus = async (question: string): Promise<string | null> => {
    if (!user?.phone) return null;

    const lowerQuestion = question.toLowerCase();
    
    // Check if question is about order status
    const orderKeywords = ['order', 'delivery', 'shipment', 'shipped', 'tracking', 'status'];
    const hasOrderKeyword = orderKeywords.some(keyword => lowerQuestion.includes(keyword));
    
    // Check for order ID pattern (ORD followed by numbers/letters)
    const orderIdMatch = question.match(/ORD[A-Z0-9]+/i);
    console.log('Question:', question, 'OrderIdMatch:', orderIdMatch);
    
    if (hasOrderKeyword || orderIdMatch) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('phone_number', user.phone)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // If specific order ID mentioned, find that order
          if (orderIdMatch && orderIdMatch[0]) {
            const specificOrder = data.find(order => 
              order.order_id.toLowerCase() === orderIdMatch[0].toLowerCase()
            );
            if (specificOrder) {
              return `Your order ${specificOrder.order_id} for ${specificOrder.product} is currently: ${specificOrder.status}. Order placed on ${new Date(specificOrder.created_at).toLocaleDateString()}.`;
            } else {
              // If order is not matched, return all available orders
              const ordersList = data.map(order => 
                `${order.order_id} - ${order.product} (${order.status})`
              ).join('\n');
              return `I couldn't find order ${orderIdMatch[0]} associated with your phone number. Here are all your orders:\n\n${ordersList}`;
            }
          } else {
            // No specific order ID mentioned, return all orders
            if (data.length === 1) {
              const latestOrder = data[0];
              return `Your order ${latestOrder.order_id} for ${latestOrder.product} is currently: ${latestOrder.status}. Order placed on ${new Date(latestOrder.created_at).toLocaleDateString()}.`;
            } else {
              const ordersList = data.map(order => 
                `${order.order_id} - ${order.product} (${order.status})`
              ).join('\n');
              return `Here are all your orders:\n\n${ordersList}`;
            }
          }
        } else {
          return "I couldn't find any orders associated with your phone number. If you've recently placed an order, it may take a few minutes to appear in our system.";
        }
      } catch (error) {
        console.error('Error checking order status:', error);
        return "I'm having trouble checking your order status right now. Please try again or contact our support team.";
      }
    }
    
    return null;
  };

  const searchFAQs = async (question: string): Promise<string> => {
    // First check if this is an order-related query
    const orderResponse = await checkOrderStatus(question);
    if (orderResponse) {
      return orderResponse;
    }

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

  const uploadFile = async (file: File): Promise<string> => {
    if (!user?.phone) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.phone}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat_uploads')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('chat_uploads')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const sendMessage = async (question: string, file?: File): Promise<void> => {
    if (!user?.phone || (!question.trim() && !file)) return;

    setIsTyping(true);

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile(file);
      }

      // Search for bot response
      const botResponse = await searchFAQs(question || 'File uploaded');

      // Save to database
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            user_phone: user.phone,
            question: question.trim() || 'File uploaded',
            bot_response: botResponse,
            file_url: fileUrl,
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
    uploadFile,
  };
};