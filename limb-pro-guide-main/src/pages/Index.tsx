import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, RotateCcw, LogOut, Menu, LogIn, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeHero } from "@/components/WelcomeHero";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { usePhysioChat } from "@/hooks/usePhysioChat";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
  } = usePhysioChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle pending message from suggestion click
  useEffect(() => {
    if (pendingMessage && user) {
      sendMessage(pendingMessage);
      setPendingMessage(null);
    } else if (pendingMessage && !user) {
      toast.error("Please sign in to use Physio AI");
      setPendingMessage(null);
    }
  }, [pendingMessage, sendMessage, user]);

  const handleSuggestionClick = useCallback((query: string) => {
    if (!user) {
      toast.error("Please sign in to use Physio AI");
      navigate("/auth");
      return;
    }
    setPendingMessage(query);
  }, [user, navigate]);

  const handleSendMessage = useCallback((message: string) => {
    if (!user) {
      toast.error("Please sign in to use Physio AI");
      navigate("/auth");
      return;
    }
    sendMessage(message);
  }, [user, navigate, sendMessage]);

  const handleSignOut = async () => {
    await signOut();
    clearChat();
    toast.success("Signed out successfully");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for logged in users */}
      {user && (
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          onNewChat={clearChat}
          isOpen={sidebarOpen}
        />
      )}

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg md:px-6">
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Physio AI</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Rehabilitation Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            )}
            
            {user && <FeedbackDialog />}
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col">
          {!hasMessages ? (
            <div className="flex flex-1 items-center justify-center">
              <WelcomeHero onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl">
                {messages.map((message, i) => (
                  <ChatMessage
                    key={i}
                    message={message}
                    isStreaming={
                      isLoading &&
                      message.role === "assistant" &&
                      i === messages.length - 1
                    }
                  />
                ))}
                
                {/* Loading indicator when waiting for first response */}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-4 bg-muted/50 px-4 py-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0s" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0.2s" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="sticky bottom-0 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-lg md:px-6">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder={user ? "Ask about OA knee, ACL tear, frozen shoulder, stroke rehab..." : "Sign in to start chatting..."}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {user ? (
                  "Your conversations are automatically saved."
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/auth")}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                    {" "}to use Physio AI and save your chat history.
                  </>
                )}
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {user && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      {user && sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 md:hidden">
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={(id) => {
              loadConversation(id);
              setSidebarOpen(false);
            }}
            onDeleteConversation={deleteConversation}
            onNewChat={() => {
              clearChat();
              setSidebarOpen(false);
            }}
            isOpen={true}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
