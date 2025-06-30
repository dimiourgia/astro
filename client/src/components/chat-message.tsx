import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  botColor?: string;
}

export default function ChatMessage({ message, botColor = "from-purple-400 to-purple-600" }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-3">
        <div className="flex-1 max-w-xs sm:max-w-md">
          <div className="chat-gradient rounded-2xl rounded-tr-sm p-4">
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="text-xs text-gray-400 mt-1 mr-2 text-right">{timeString}</div>
        </div>
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-xs text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 bg-gradient-to-br ${botColor} rounded-full flex items-center justify-center flex-shrink-0`}>
        <Bot className="text-xs text-white" />
      </div>
      <div className="flex-1">
        <div className="cosmic-card rounded-2xl rounded-tl-sm p-4 border-purple-800/30">
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="text-xs text-gray-400 mt-1 ml-2">{timeString}</div>
      </div>
    </div>
  );
}
