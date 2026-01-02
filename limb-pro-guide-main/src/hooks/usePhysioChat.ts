import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/physio-chat`;

export function usePhysioChat() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    
    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }
    
    setConversations(data || []);
  }, [user]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading messages:", error);
      return;
    }
    
    setMessages(data?.map(m => ({ role: m.role as "user" | "assistant", content: m.content })) || []);
    setCurrentConversationId(conversationId);
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    
    setCurrentConversationId(data.id);
    await loadConversations();
    return data.id;
  }, [user, loadConversations]);

  // Save a message
  const saveMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role, content });
    
    if (error) {
      console.error("Error saving message:", error);
    }
    
    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }, [user]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);
    
    if (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
      return;
    }
    
    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
    
    await loadConversations();
    toast.success("Conversation deleted");
  }, [user, currentConversationId, loadConversations]);

  // Send message - requires authentication
  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Require authentication
    if (!user || !session?.access_token) {
      toast.error("Please sign in to use Physio AI");
      return;
    }

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let conversationId = currentConversationId;
    
    // Create conversation if this is the first message
    if (!conversationId) {
      conversationId = await createConversation(input.trim());
    }

    // Save user message
    if (conversationId) {
      await saveMessage(conversationId, "user", input.trim());
    }

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      abortControllerRef.current = new AbortController();
      
      const startRequest = (accessToken: string) =>
        fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
          signal: abortControllerRef.current.signal,
        });

      let resp = await startRequest(session.access_token);

      // If token is stale, refresh once and retry
      if (resp.status === 401) {
        const { data, error } = await supabase.auth.refreshSession();
        const refreshedToken = data.session?.access_token;
        if (!error && refreshedToken) {
          resp = await startRequest(refreshedToken);
        }
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 401) {
          toast.error("Session expired. Please sign in again.");
        } else if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (resp.status === 402) {
          toast.error("Usage limit reached. Please add credits to continue.");
        } else {
          toast.error(errorData.error || "Failed to get response. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            // ignore
          }
        }
      }

      // Save assistant message
      if (conversationId && assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
        await loadConversations();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Chat error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, user, session, currentConversationId, createConversation, saveMessage, loadConversations]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setCurrentConversationId(null);
    setIsLoading(false);
  }, []);

  // Load conversations on mount when user is available
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    loadConversations,
  };
}
