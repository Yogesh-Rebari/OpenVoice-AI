import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, ComplaintContext, INITIAL_CONTEXT } from './types';
import { processMessage } from './services/gemini';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Separator } from './components/ui/separator';
import { Textarea } from './components/ui/textarea';
import { 
  Send, User, Bot, AlertCircle, CheckCircle2, MapPin, Clock, 
  Shield, Info, Star, MessageSquare, X, Menu, Lock, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./components/ui/dialog";

import { cn } from '@/lib/utils';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "SYSTEM BOOT COMPLETE. Secure channel established. How can I assist you with your report today?" }
  ]);
  const [context, setContext] = useState<ComplaintContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const anonymousId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);
  const transmissionId = useMemo(() => `#OV-${Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}`, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isSubmitted) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await processMessage(newMessages, context);
      setMessages([...newMessages, { role: 'assistant', content: result.reply }]);
      setContext(result.updatedContext);
      setIsReady(result.isReadyForSummary);
      if (result.isSubmitted) {
        setIsSubmitted(true);
        toast.success("Complaint registered successfully", {
          description: "Your report has been encrypted and queued for processing.",
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "CONNECTION ERROR. Retrying secure handshake...";
      setMessages([...newMessages, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = () => {
    toast.success("Feedback received", {
      description: "Thank you for helping us improve OpenVoice AI.",
    });
    setIsFeedbackOpen(false);
    setFeedbackRating(0);
    setFeedbackText('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-300 flex flex-col font-sans selection:bg-emerald-500/30">
      <Toaster position="top-center" richColors />
      
      {/* Technical Grid Overlay */}
      <div className="fixed inset-0 technical-grid opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="bg-[#0D0D0F]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center glow-accent">
            <Shield className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              OPENVOICE <span className="text-emerald-500 font-mono text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">v3.0</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Secure Node: ASIA-EAST-1</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Feedback
              </Button>
            } />
            <DialogContent className="bg-[#0D0D0F] border-white/10 text-gray-300">
              <DialogHeader>
                <DialogTitle className="text-white">System Feedback</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Help us improve the anonymous reporting experience.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={cn(
                          "p-1 transition-all",
                          feedbackRating >= star ? "text-emerald-500 scale-110" : "text-gray-700 hover:text-gray-500"
                        )}
                      >
                        <Star className={cn("w-6 h-6", feedbackRating >= star && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Comments</label>
                  <Textarea 
                    placeholder="Tell us about your experience..." 
                    className="bg-white/5 border-white/10 focus:border-emerald-500/50 min-h-[100px]"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={submitFeedback}
                  disabled={!feedbackRating}
                  className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold w-full"
                >
                  SUBMIT FEEDBACK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-400">ANONYMOUS_ID: {anonymousId}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:overflow-hidden">
        {/* Chat Section */}
        <section className="lg:col-span-7 flex flex-col h-auto lg:h-[calc(100vh-140px)] min-h-[500px]">
          <Card className="flex-1 flex flex-col overflow-hidden border-white/5 bg-[#0D0D0F]/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest text-white">Secure_Intake.exe</CardTitle>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                <div className="space-y-8 max-w-2xl mx-auto">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex gap-4",
                          msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border",
                          msg.role === 'user' ? "bg-white/5 border-white/10" : "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                          {msg.role === 'user' ? <User className="w-4 h-4 text-gray-400" /> : <Bot className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className={cn(
                          "max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg",
                          msg.role === 'user' 
                            ? "bg-emerald-600 text-white rounded-tr-none font-medium" 
                            : "bg-[#161618] border border-white/5 rounded-tl-none text-gray-300"
                        )}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="bg-[#161618] border border-white/5 rounded-2xl rounded-tl-none px-5 py-3.5 flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                <div className="relative max-w-2xl mx-auto group">
                  <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                  <div className="relative flex gap-2">
                    <Input
                      placeholder={isSubmitted ? "TRANSMISSION COMPLETE" : "Enter report details..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading || isSubmitted}
                      className="flex-1 py-6 rounded-xl bg-[#0D0D0F] border-white/10 focus-visible:ring-emerald-500/50 text-white placeholder:text-gray-600"
                    />
                    <Button 
                      size="icon" 
                      className="w-14 h-14 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                      onClick={handleSend}
                      disabled={isLoading || isSubmitted || !input.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">AES-256</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Zero-Knowledge</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Summary Section */}
        <section className="lg:col-span-5 flex flex-col h-auto lg:h-[calc(100vh-140px)] min-h-[500px]">
          <Card className="flex-1 flex flex-col overflow-hidden border-white/5 bg-[#0D0D0F]/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono uppercase tracking-widest text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Data_Extraction
                </CardTitle>
                {context.priority && (
                  <Badge className={cn("font-mono text-[10px] border", getPriorityColor(context.priority))}>
                    {context.priority}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-500 text-xs">Real-time telemetry analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-8">
                {/* Primary Info */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Category</p>
                      <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-medium">
                        {context.category || '---'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Subcategory</p>
                      <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-medium">
                        {context.subcategory || '---'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Subject</p>
                    <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-medium leading-relaxed">
                      {context.issue || 'Awaiting input...'}
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-start gap-4 group">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                      <MapPin className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Geo_Location</p>
                      <p className="text-sm text-gray-300">{context.location || 'PENDING_INPUT'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                      <Clock className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Timestamp</p>
                      <p className="text-sm text-gray-300">{context.time || 'PENDING_INPUT'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                      <AlertCircle className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Severity_Index</p>
                      <p className="text-sm text-gray-300">{context.severity || 'CALCULATING...'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Detailed_Log</p>
                  <div className="bg-[#080809] rounded-xl p-4 border border-white/5 min-h-[100px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      {context.description || '> Waiting for user input to populate detailed log...'}
                    </p>
                  </div>
                </div>

                {isReady && !isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 pb-8"
                  >
                    <Button 
                      onClick={() => {
                        setIsSubmitted(true);
                        toast.success("Complaint registered successfully", {
                          description: "Your report has been encrypted and queued for processing.",
                        });
                      }}
                      className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold py-7 rounded-xl shadow-lg shadow-emerald-500/20 group relative overflow-hidden transition-all active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      CONFIRM & SUBMIT REPORT
                    </Button>
                    <p className="text-[10px] text-center text-gray-600 font-mono mt-4 uppercase tracking-widest opacity-50">
                      Final verification required for transmission
                    </p>
                  </motion.div>
                )}

                {isSubmitted && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4 glow-accent"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/40">
                      <CheckCircle2 className="text-black w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">Transmission Successful</p>
                      <p className="text-[10px] font-mono text-emerald-500/70 mt-0.5">ID: {transmissionId}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}



