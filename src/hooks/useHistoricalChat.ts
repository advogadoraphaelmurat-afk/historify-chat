import { useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-historical-figure`;

export const useHistoricalChat = (figureId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    // Client-side input validation
    if (!userMessage || userMessage.trim().length === 0) {
      toast.error("A mensagem não pode estar vazia");
      return;
    }
    
    if (userMessage.length > 5000) {
      toast.error("Mensagem muito longa. Máximo de 5000 caracteres.");
      return;
    }
    
    if (messages.length >= 50) {
      toast.error("Conversa muito longa. Inicie uma nova conversa.");
      return;
    }
    
    const newUserMessage: Message = { role: "user", content: userMessage.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          figure: figureId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Aguarde um momento.");
        } else if (response.status === 402) {
          toast.error("Créditos insuficientes. Entre em contato com o suporte.");
        } else if (response.status === 400) {
          toast.error(errorData?.error || "Requisição inválida");
        } else {
          toast.error("Erro ao conectar com o servidor");
        }
        setMessages((prev) => prev.slice(0, -1)); // Remove the failed message
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.trim() || line.startsWith(":")) return;
        if (!line.startsWith("data: ")) return;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: assistantContent },
                ];
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch (e) {
          console.error("Failed to parse SSE line:", e);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
          buffer = buffer.slice(newlineIndex + 1);
          processLine(line);
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        buffer.split("\n").forEach(processLine);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};
