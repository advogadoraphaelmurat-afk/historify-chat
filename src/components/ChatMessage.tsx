import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  figureName?: string;
}

const ChatMessage = ({ role, content, figureName }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        )}
      >
        {role === "assistant" && figureName && (
          <p className="text-xs font-semibold text-accent mb-2">{figureName}</p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
