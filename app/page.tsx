"use client";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import ReactMarkdown from "react-markdown";

import {
  Send,
  Bot,
  User,
  Download,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequirementsPanel } from "@/components/RequirementsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "requirement" | "clarification" | "general";
  requirements?: ExtractedRequirement[];
}

interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  type: "functional" | "non-functional";
  priority: "high" | "medium" | "low";
  category: string;
  acceptance_criteria: string[];
  estimated_effort: string;
  dependencies: string[];
}

export default function AgileRequirementsChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "connected" | "disconnected" | "fallback"
  >("disconnected");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: "1",
      content:
        "Hello! I'm your AI-powered Agile Requirements Assistant. I'm here to help you capture, clarify, and organize your software requirements through natural conversation. Let's start by discussing your project goals. What kind of software are you planning to develop?",
      sender: "bot",
      timestamp: new Date(),
      type: "general",
    };
    setMessages([welcomeMessage]);
    // Check API status
    checkApiStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setApiStatus(data.status);
    } catch (error) {
      setApiStatus("fallback");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
        type: data.type || "general",
        requirements: data.requirements || [],
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update requirements if any were extracted
      if (data.requirements && data.requirements.length > 0) {
        setRequirements((prev) => {
          const newReqs = data.requirements.filter(
            (req: ExtractedRequirement) =>
              !prev.some((existing) => existing.id === req.id)
          );
          return [...prev, ...newReqs];
        });
      }
      setApiStatus("connected");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Using fallback response.");
      setApiStatus("fallback");

      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I'm having trouble connecting to the AI service right now. However, I can still help you document your requirements manually. Could you please describe the main functionality you need for your software project?",
        sender: "bot",
        timestamp: new Date(),
        type: "general",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exportRequirements = () => {
    const exportData = {
      requirements,
      conversation: messages,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requirements-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case "connected":
        return "bg-emerald-500";
      case "fallback":
        return "bg-amber-500";
      default:
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case "connected":
        return "Gemini AI Connected";
      case "fallback":
        return "Fallback Mode";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100">
      <div className="  p-4 h-screen">
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-6 h-full">
          {/* Main Chat Interface */}
          <div className="xl:col-span-3 lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-2xl min-h-0">
              <CardHeader className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span>Agile Requirements Assistant</span>
                      <span className="text-sm font-normal text-gray-400">
                        Powered by Gemini AI
                      </span>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
                    ></div>
                    <span className="text-sm font-medium text-gray-300">
                      {getStatusText()}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages Container - Fixed height with scroll */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>
                            Start a conversation to begin capturing requirements
                          </p>
                        </div>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              : "bg-gray-700/80 border border-gray-600 text-gray-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.sender === "bot" && (
                              <div className="p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {message.sender === "user" && (
                              <div className="p-1.5 bg-blue-500/30 rounded-full shrink-0">
                                <User className="w-4 h-4 text-blue-100" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {/* Use ReactMarkdown for bot messages, plain text for user */}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.sender === "bot" ? (
                                  <ReactMarkdown>
                                    {message.content}
                                  </ReactMarkdown>
                                ) : (
                                  message.content
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                {message.type && message.type !== "general" && (
                                  <Badge
                                    className="text-xs bg-gray-600/50 text-gray-300 border-gray-500"
                                    variant="secondary"
                                  >
                                    {message.type}
                                  </Badge>
                                )}
                                <p className="text-xs text-gray-400 ml-auto">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700/80 border border-gray-600 rounded-2xl p-4 max-w-[75%] shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert className="mx-4 mb-4 bg-red-900/50 border-red-700 text-red-100">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Input Area */}
                  <div className="border-t border-gray-700 bg-gray-800/80 backdrop-blur-sm p-4 shrink-0">
                    <div className="flex gap-3">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your requirements or ask clarifying questions..."
                        disabled={isLoading}
                        className="flex-1 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requirements Panel */}
          <div className="flex flex-col min-h-0">
            <Card className="flex-1 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-2xl">
              <CardHeader className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-100">
                    Captured Requirements
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportRequirements}
                      disabled={requirements.length === 0}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                <Tabs
                  defaultValue="requirements"
                  className="w-full h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 border-b border-gray-600 rounded-none">
                    <TabsTrigger
                      value="requirements"
                      className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                    >
                      Requirements
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                    >
                      Settings
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="requirements"
                    className="p-4 flex-1 overflow-y-auto"
                  >
                    <RequirementsPanel requirements={requirements} />
                  </TabsContent>
                  <TabsContent
                    value="settings"
                    className="p-4 flex-1 overflow-y-auto"
                  >
                    <SettingsPanel
                      apiStatus={apiStatus}
                      onStatusCheck={checkApiStatus}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
