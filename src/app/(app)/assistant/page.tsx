"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/page-header";
import { Bot, Loader, Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiCareerAssistant } from "@/ai/flows/ai-career-assistant";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
  role: "user" | "bot";
  text: string;
};

const quickSuggestions = [
  "How can I improve my resume?",
  "What skills are in demand for 2025?",
  "Tips for negotiating salary",
  "How to prepare for technical interviews?",
  "Best way to switch careers?",
  "How to build a strong portfolio?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (query?: string) => {
    const userMessage = query || input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiCareerAssistant({ query: userMessage });
      setMessages((prev) => [...prev, { role: "bot", text: res.response }]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Getting Response",
        description: "The AI assistant is currently unavailable.",
      });
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I'm having some trouble right now. Please try again later." }]);
    }
    setLoading(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 pt-6">
        <PageHeader
            title="AI Career Assistant"
            subtitle="Your personal AI mentor for career advice and strategies."
        />
      </div>
      <div className="flex-grow p-4 md:px-8 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
             <div className="relative mb-4">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse-glow"></div>
              <Avatar className="h-24 w-24 relative border-2 border-primary/50 avatar-glow-bot">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <Bot size={48}/>
                  </AvatarFallback>
              </Avatar>
             </div>
             <div className="space-y-2">
               <p className="font-headline text-3xl text-primary text-glow">How can I help you today?</p>
               <p className="text-muted-foreground text-sm max-w-md">
                 Ask me anything about career advice, skill development, interviews, or job search strategies.
               </p>
             </div>
           </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500",
              message.role === "user" ? "self-end flex-row-reverse" : "self-start"
            )}
          >
            <Avatar className={cn(
              "border-2 shrink-0",
              message.role === 'bot' ? "border-primary/30 avatar-glow-bot" : "border-accent/30 avatar-glow-user"
            )}>
              <AvatarFallback className={cn(
                message.role === 'bot' 
                  ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary" 
                  : "bg-gradient-to-br from-accent/20 to-accent/10 text-accent"
              )}>
                {message.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-accent/10 text-foreground rounded-br-none border border-accent/20 message-glow-user"
                  : "bg-primary/10 text-foreground rounded-bl-none border border-primary/20 message-glow-bot"
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="self-start flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Avatar className="border-2 border-primary/30 avatar-glow-bot shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </AvatarFallback>
            </Avatar>
            <div className="rounded-xl rounded-bl-none px-4 py-3 bg-primary/10 border border-primary/20 message-glow-bot flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '150ms'}}></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '300ms'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 p-4 md:p-8 pt-2 bg-background/95 backdrop-blur-md border-t border-primary/10">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-3 w-3 text-primary/70" />
              {suggestion}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Ask about career advice, skills, interviews..."
            className="pr-12 h-12 bg-card border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            disabled={loading}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 button-glow bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
