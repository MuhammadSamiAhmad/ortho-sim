"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Lightbulb,
  Clock,
  Star,
} from "lucide-react";
import TraineeLayout from "@/components/trainee/TraineeLayout";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  category?: string;
  rating?: number;
}

interface ChatLog {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  category: string | null;
  rating: number | null;
}

export default function TraineeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
    // Add welcome message
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content:
          "Hello! I'm your AI assistant specialized in orthopedic surgery education. I can help you with questions about surgical procedures, anatomy, techniques, and best practices. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("/api/trainee/chat?limit=20");
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/trainee/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          category: "general",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.response,
          timestamp: data.timestamp,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        fetchChatHistory(); // Refresh history
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I'm experiencing technical difficulties. Please try again later or consult your mentor for immediate assistance.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content:
          "Hello! I'm your AI assistant specialized in orthopedic surgery education. I can help you with questions about surgical procedures, anatomy, techniques, and best practices. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const loadHistoryMessage = (log: ChatLog) => {
    const userMessage: ChatMessage = {
      id: `history-user-${log.id}`,
      type: "user",
      content: log.prompt,
      timestamp: log.timestamp,
      category: log.category || undefined,
    };

    const assistantMessage: ChatMessage = {
      id: `history-assistant-${log.id}`,
      type: "assistant",
      content: log.response,
      timestamp: log.timestamp,
      rating: log.rating || undefined,
    };

    setMessages([userMessage, assistantMessage]);
    setShowHistory(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const suggestedQuestions = [
    "What are the key steps in intramedullary nailing of the tibia?",
    "How do I properly position the guide wire?",
    "What are common complications in tibial nailing?",
    "Explain the anatomy of the tibia relevant to IM nailing",
    "What imaging is needed before tibial nailing surgery?",
  ];

  return (
    <TraineeLayout currentPage="chat">
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3 text-[#00cfb6]" />
              AI Assistant
            </h1>
            <p className="text-gray-300">
              Get help with orthopedic surgery questions and procedures
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Clock className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chat History Sidebar */}
          {showHistory && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#00cfb6]" />
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => loadHistoryMessage(log)}
                        className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                          {log.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">
                            {formatDate(log.timestamp)}
                          </span>
                          {log.rating && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-yellow-400 text-xs">
                                {log.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No chat history yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Chat Area */}
          <Card
            className={`bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col ${
              showHistory ? "lg:col-span-3" : "lg:col-span-4"
            }`}
          >
            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[80%] ${
                        message.type === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.type === "user"
                            ? "bg-[#00cfb6]"
                            : "bg-blue-500/20 border border-blue-500/30"
                        }`}
                      >
                        {message.type === "user" ? (
                          <User className="w-4 h-4 text-slate-900" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-400" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-[#00cfb6] text-slate-900"
                            : "bg-white/10 text-white border border-white/20"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs ${
                              message.type === "user"
                                ? "text-slate-700"
                                : "text-gray-400"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </span>
                          {message.rating && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-yellow-400 text-xs">
                                {message.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-white/10 text-white border border-white/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#00cfb6]" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-4 h-4 text-[#00cfb6] mr-2" />
                  <span className="text-white text-sm font-medium">
                    Suggested Questions:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="border-white/20 text-white hover:bg-white/10 text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask me about orthopedic surgery procedures..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                AI responses are for educational purposes only. Always consult
                with your mentor or qualified medical professionals for clinical
                decisions.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </TraineeLayout>
  );
}
