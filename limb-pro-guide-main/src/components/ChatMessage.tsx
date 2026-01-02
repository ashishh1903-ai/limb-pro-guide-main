import { cn } from "@/lib/utils";
import { Activity, User } from "lucide-react";
import type { Message } from "@/hooks/usePhysioChat";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-6 animate-slide-up",
        isAssistant ? "bg-muted/50" : "bg-transparent"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isAssistant
            ? "gradient-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isAssistant ? (
          <Activity className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          {isAssistant ? "Physio AI" : "You"}
        </p>
        <div
          className={cn(
            "prose-physio text-foreground",
            isStreaming && "after:ml-1 after:inline-block after:h-4 after:w-2 after:animate-pulse after:bg-primary after:content-['']"
          )}
        >
          <FormattedContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Simple markdown-like parsing for better display
  const lines = content.split("\n");
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Empty lines
        if (!trimmed) return <div key={i} className="h-2" />;
        
        // Image markdown
        const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
          const [, alt, src] = imageMatch;
          return (
            <div key={i} className="my-4">
              <img
                src={src}
                alt={alt || "Disease illustration"}
                className="max-w-full rounded-lg border border-border shadow-sm"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
              {alt && (
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {alt}
                </p>
              )}
            </div>
          );
        }
        
        // Headers with emojis (like 🦴 1. Disease Name)
        if (/^[🦴📖⚠️🩻💊🏃‍♂️📌🧠🔹]/.test(trimmed)) {
          return (
            <h3 key={i} className="mt-4 text-base font-semibold text-primary">
              {trimmed}
            </h3>
          );
        }
        
        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <li key={i} className="ml-4 list-disc text-foreground/90">
              {trimmed.slice(2)}
            </li>
          );
        }
        
        // Numbered items
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <li key={i} className="ml-4 list-decimal text-foreground/90">
              {trimmed.replace(/^\d+\.\s/, "")}
            </li>
          );
        }
        
        // Bold text patterns
        if (trimmed.includes("**")) {
          const parts = trimmed.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i}>
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="font-semibold">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        }
        
        // Regular paragraphs
        return (
          <p key={i} className="leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
