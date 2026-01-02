import { MessageSquare, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/usePhysioChat";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  isOpen,
}: ConversationSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-muted/30">
      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                  currentConversationId === conv.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">
                  {conv.title || "New conversation"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
