import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  User, 
  Bot, 
  Clock,
  CheckCircle,
  Paperclip,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to MotoRise Support. How can I help you today?',
      sender: 'support',
      timestamp: new Date(Date.now() - 60000),
      status: 'read'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getSupportResponse(newMessage),
        sender: 'support',
        timestamp: new Date(),
        status: 'read'
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const getSupportResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('battery')) {
      return "I understand you're having battery issues. Let me help you troubleshoot this. First, have you tried charging your scooter for at least 4-6 hours using the original charger?";
    } else if (message.includes('brake')) {
      return "Brake issues are important for safety. Can you describe what exactly is happening with the brakes? Are they too loose, too tight, or making unusual sounds?";
    } else if (message.includes('speed') || message.includes('slow')) {
      return "If your scooter is running slower than usual, this could be related to battery level, tire pressure, or the speed controller. What's the current battery level showing on your display?";
    } else if (message.includes('charge') || message.includes('charging')) {
      return "For charging issues, please check: 1) The charging port is clean and dry 2) The charger LED indicator 3) Try a different power outlet. What symptoms are you experiencing exactly?";
    } else {
      return "Thank you for contacting MotoRise support. I'm here to help with any issues you're experiencing with your electric scooter. Could you please provide more details about the problem?";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-4 card-electric">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-navy">MotoRise Support</CardTitle>
                  <p className="text-sm text-muted-foreground">Online now</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="resolved">Support Active</Badge>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-4 card-electric">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'user' && (
                        <div className="flex items-center space-x-1">
                          {message.status === 'sent' && <Clock className="h-3 w-3 opacity-70" />}
                          {message.status === 'delivered' && <CheckCircle className="h-3 w-3 opacity-70" />}
                          {message.status === 'read' && <CheckCircle className="h-3 w-3 text-success" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-foreground px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card className="card-electric">
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" className="btn-electric" disabled={!newMessage.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Our support team typically responds within 2-3 minutes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};