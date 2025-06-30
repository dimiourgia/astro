import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/chat-message";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatPageProps {
  userId: string;
  botId: string;
}

export default function ChatPage({ userId, botId }: ChatPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const userIdNum = parseInt(userId);

  // Get bot info
  const { data: botsData } = useQuery({
    queryKey: ['/api/bots'],
    queryFn: api.getBots
  });

  const currentBot = botsData?.bots?.find((bot: any) => bot.id === botId);

  // Start or get existing chat session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/chat/start', userIdNum, botId],
    queryFn: () => api.startChatSession(userIdNum, botId),
    enabled: !!userIdNum && !!botId
  });

  // Get chat messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', sessionId],
    queryFn: () => api.getChatMessages(sessionId!),
    enabled: !!sessionId
  });

  // Update session ID when session is loaded
  useEffect(() => {
    if (sessionData?.session?.id) {
      setSessionId(sessionData.session.id);
    }
  }, [sessionData]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: number; content: string }) =>
      api.sendMessage(sessionId, content),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', sessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({
      sessionId,
      content: message.trim()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goToMainScreen = () => {
    setLocation(`/main/${userId}`);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="cosmic-card border-b border-purple-800/30 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Skeleton className="h-8 w-16 bg-gray-700" />
            <Skeleton className="h-10 w-48 bg-gray-700" />
            <Skeleton className="h-6 w-20 bg-gray-700" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat Header */}
      <div className="cosmic-card border-b border-purple-800/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={goToMainScreen}
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {currentBot && (
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${currentBot.color} rounded-full flex items-center justify-center`}>
                <Bot className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">{currentBot.name}</div>
                <div className="text-xs text-gray-400">{currentBot.specialization}</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messagesLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-gray-700" />
            ))
          ) : (
            messagesData?.messages?.map((msg: any) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                botColor={currentBot?.color || "from-purple-400 to-purple-600"}
              />
            ))
          )}
          
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${currentBot?.color || 'from-purple-400 to-purple-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Bot className="text-xs text-white" />
              </div>
              <div className="cosmic-card rounded-2xl rounded-tl-sm p-4 border-purple-800/30">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="cosmic-card border-t border-purple-800/30 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your birth chart, relationships, career, or any astrological question..."
                rows={1}
                className="cosmic-input placeholder-gray-400 resize-none max-h-32"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !sessionId || sendMessageMutation.isPending}
              className="cosmic-button p-3 rounded-xl flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
