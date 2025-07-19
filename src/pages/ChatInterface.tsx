import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Bot, 
  User,
  ThumbsDown,
  ThumbsUp,
  AlertCircle,
  Phone,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useUsers } from '@/hooks/useUsers';

export const ChatInterface = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, isLoading, isTyping, sendMessage, markAsUnsatisfied } = useChat();
  const { createOrUpdateUser } = useUsers();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure user exists in Supabase when component mounts
  useEffect(() => {
    if (user?.phone && user?.role) {
      createOrUpdateUser(user.phone, user.role).catch(console.error);
    }
  }, [user, createOrUpdateUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isTyping) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await sendMessage(messageText);
      toast({
        title: "Message sent",
        description: "Your message has been processed successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setNewMessage(messageText); // Restore message on error
    }
  };

  const handleUnsatisfied = async (chatId: string) => {
    try {
      await markAsUnsatisfied(chatId);
      toast({
        title: "Feedback received",
        description: "Our support team has been notified and will assist you further.",
      });
    } catch (error) {
      console.error('Error marking as unsatisfied:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile-first header - fixed at top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">MotoRise Support</h1>
                <p className="text-sm text-muted-foreground">AI Assistant • Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                <MessageCircle className="h-3 w-3 mr-1" />
                Support Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages area - scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-3 sm:px-4 py-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Welcome to MotoRise Support!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm here to help with any questions about your electric scooter. 
                Ask me anything - from battery issues to maintenance tips!
              </p>
            </div>
          )}

          {/* Chat messages */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* User question */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] sm:max-w-md">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg rounded-br-sm">
                      <p className="text-sm">{message.question}</p>
                    </div>
                    <div className="flex items-center justify-end mt-1 space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Bot response */}
                {message.bot_response && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-lg">
                      <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-sm">
                        <p className="text-sm">{message.bot_response}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        
                        {/* Feedback buttons */}
                        {!message.is_unsatisfied && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600"
                              onClick={() => {
                                toast({
                                  title: "Thank you!",
                                  description: "Your feedback helps us improve our service.",
                                });
                              }}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={() => handleUnsatisfied(message.id)}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {message.is_unsatisfied && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Escalated to support
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-sm">
                  <div className="flex items-center space-x-1">
                    <Bot className="h-3 w-3 text-muted-foreground" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message input - fixed at bottom */}
      <div className="border-t bg-background">
        <div className="p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about your scooter..."
                  className="min-h-[44px] resize-none"
                  disabled={isTyping}
                  maxLength={500}
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                className="min-h-[44px] px-4"
                disabled={!newMessage.trim() || isTyping}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ask about battery, brakes, charging, or any scooter issues
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};