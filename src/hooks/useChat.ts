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
    
    // Check for order ID pattern (ORD followed by numbers, not just letters)
    const orderIdMatch = question.match(/\bORD\d+[A-Z0-9]*\b/i);
    
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

      // Improved search with better scoring and minimum threshold
      const searchTerms = question.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(' ')
        .filter(term => term.length > 2)
        .filter(term => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'way', 'she', 'use', 'your', 'what', 'when', 'where', 'will', 'with'].includes(term)); // Filter out common stop words

      if (searchTerms.length === 0) {
        return "Thank you for contacting MotoRise support. I'm here to help with any issues you're experiencing with your electric scooter.";
      }

      // Define semantic synonyms for better matching
      const synonyms: Record<string, string[]> = {
        'interval': ['schedule', 'frequency', 'maintenance', 'routine'],
        'schedule': ['interval', 'timing', 'frequency', 'maintenance'],
        'maintenance': ['service', 'schedule', 'interval', 'routine'],
        'service': ['maintenance', 'repair', 'schedule'],
        'delayed': ['late', 'postponed', 'rescheduled'],
        'appointment': ['booking', 'reservation', 'slot']
      };

      let bestMatch: FAQ | null = null;
      let bestScore = 0;

      data?.forEach((faq) => {
        const faqQuestion = faq.question.toLowerCase().replace(/[^\w\s]/g, '');
        const faqResponse = faq.response.toLowerCase().replace(/[^\w\s]/g, '');
        
        let score = 0;
        
        // Create expanded search terms including synonyms
        const expandedSearchTerms = [...searchTerms];
        searchTerms.forEach(term => {
          if (synonyms[term]) {
            expandedSearchTerms.push(...synonyms[term]);
          }
        });

        // Higher weight for matches in the question title
        searchTerms.forEach(term => {
          // Exact word match in question (highest priority)
          if (faqQuestion.split(' ').includes(term)) {
            score += 15;
          }
          // Partial match in question
          else if (faqQuestion.includes(term)) {
            score += 8;
          }
          // Exact word match in response
          else if (faqResponse.split(' ').includes(term)) {
            score += 3;
          }
          // Partial match in response (lowest priority)
          else if (faqResponse.includes(term)) {
            score += 1;
          }
        });

        // Check for semantic matches with synonyms (lower weight)
        expandedSearchTerms.forEach(term => {
          if (!searchTerms.includes(term)) { // Only check synonyms, not original terms
            if (faqQuestion.split(' ').includes(term)) {
              score += 5;
            } else if (faqQuestion.includes(term)) {
              score += 2;
            }
          }
        });

        // Bonus for multiple term matches
        const matchingTerms = searchTerms.filter(term => 
          faqQuestion.includes(term) || faqResponse.includes(term)
        ).length;
        
        if (matchingTerms > 1) {
          score += matchingTerms * 3; // Bonus for multiple relevant terms
        }

        // Calculate relevance ratio (matched terms / total terms)
        const relevanceRatio = matchingTerms / searchTerms.length;
        if (relevanceRatio >= 0.5) { // At least 50% of terms should match
          score += Math.floor(relevanceRatio * 10);
        }

        // Special handling for specific question patterns
        const questionLower = question.toLowerCase();
        
        // Service interval/schedule questions should match maintenance
        if ((questionLower.includes('service') && (questionLower.includes('interval') || questionLower.includes('schedule'))) ||
            (questionLower.includes('maintenance') && questionLower.includes('schedule'))) {
          if (faqQuestion.includes('maintenance') && faqQuestion.includes('schedule')) {
            score += 20; // High boost for maintenance schedule
          }
          // Penalize delayed service responses for interval questions
          if (faqQuestion.includes('delayed') || faqResponse.includes('delayed')) {
            score -= 15;
          }
        }

        // Delayed service questions should match delayed responses
        if (questionLower.includes('delayed') || questionLower.includes('late') || questionLower.includes('postponed')) {
          if (faqQuestion.includes('delayed') || faqResponse.includes('delayed')) {
            score += 20;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = faq;
        }
      });

      // Require minimum threshold for a meaningful match
      const minimumThreshold = Math.max(12, searchTerms.length * 4);
      
      if (bestMatch && bestScore >= minimumThreshold) {
        console.info('FAQ match found:', { question, bestScore, matchedFAQ: bestMatch.question });
        return bestMatch.response;
      }

      console.info('No relevant FAQ found:', { question, bestScore, threshold: minimumThreshold, searchTerms });
      
      // Default response if no meaningful match found
      return "Thank you for contacting MotoRise support. I'm here to help with any issues you're experiencing with your electric scooter.";
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
    console.log('SendMessage called with:', { 
      userPhone: user?.phone, 
      question, 
      hasFile: !!file,
      user 
    });
    
    if (!user?.phone || (!question.trim() && !file)) {
      console.error('SendMessage validation failed:', {
        hasUserPhone: !!user?.phone,
        hasQuestion: !!question.trim(),
        hasFile: !!file
      });
      throw new Error('Invalid input: User phone or message content is missing');
    }

    setIsTyping(true);

    try {
      let fileUrl = null;
      if (file) {
        console.log('Uploading file:', file.name);
        try {
          fileUrl = await uploadFile(file);
          console.log('File uploaded successfully:', fileUrl);
        } catch (fileError) {
          console.error('File upload error:', fileError);
          throw new Error(`File upload failed: ${fileError.message}`);
        }
      }

      // Search for bot response
      console.log('Searching FAQs for:', question || 'File uploaded');
      let botResponse;
      try {
        botResponse = await searchFAQs(question || 'File uploaded');
        console.log('Bot response generated:', botResponse);
      } catch (faqError) {
        console.error('FAQ search error:', faqError);
        botResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team directly.";
      }

      // Save to database
      console.log('Attempting to save to database:', {
        user_phone: user.phone,
        question: question.trim() || 'File uploaded',
        bot_response: botResponse,
        file_url: fileUrl,
      });
      
      const insertData = {
        user_phone: user.phone,
        question: question.trim() || 'File uploaded',
        bot_response: botResponse,
        file_url: fileUrl,
        is_unsatisfied: false,
        resolved: false,
      };
      
      console.log('Insert data prepared:', insertData);
      
      const { data, error } = await supabase
        .from('chats')
        .insert([insertData])
        .select()
        .single();

      console.log('Supabase insert response:', { data, error });

      if (error) {
        console.error('Supabase insert error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          insertData
        });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from insert operation');
        throw new Error('No data returned from database');
      }

      console.log('Message saved successfully:', data);
      // Add to local state
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message (detailed):', {
        error,
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      });
      
      // Re-throw with more descriptive error
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
      }
      
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  const markAsUnsatisfied = async (chatId: string): Promise<void> => {
    try {
      // Get the chat details for the ticket
      const chat = messages.find(m => m.id === chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Update the chat record
      const { error: chatError } = await supabase
        .from('chats')
        .update({ is_unsatisfied: true })
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Add to unsatisfied_queries table
      await supabase
        .from('unsatisfied_queries')
        .insert([
          {
            chat_id: chatId,
            user_phone: chat.user_phone,
            file_url: chat.file_url,
          }
        ]);

      // Create a support ticket
      const ticketTitle = chat.question.length > 50 
        ? chat.question.substring(0, 50) + '...'
        : chat.question;

      await supabase
        .from('tickets')
        .insert([
          {
            chat_id: chatId,
            user_phone: chat.user_phone,
            title: ticketTitle
          }
        ]);

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === chatId ? { ...msg, is_unsatisfied: true } : msg
        )
      );

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