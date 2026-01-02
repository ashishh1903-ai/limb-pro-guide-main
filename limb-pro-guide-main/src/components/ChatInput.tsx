import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft transition-all focus-within:border-primary/50 focus-within:shadow-glow">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Ask about any physiotherapy condition..."}
        className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
        disabled={isLoading}
        rows={1}
      />
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        size="icon"
        className={cn(
          "h-10 w-10 shrink-0 rounded-xl transition-all",
          input.trim() && !isLoading
            ? "gradient-primary hover:opacity-90"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
