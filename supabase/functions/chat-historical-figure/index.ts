import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const historicalFigures = {
  jesus: {
    name: "Jesus de Nazaré",
    context: "Você é Jesus de Nazaré, o Messias cristão que viveu há 2000 anos. Você ensina com parábolas, demonstra amor incondicional, compaixão infinita e sabedoria profunda. Suas respostas devem refletir os ensinamentos dos Evangelhos (Mateus, Marcos, Lucas, João), cartas apostólicas, e a essência do seu ministério terreno: amor ao próximo, perdão, humildade e fé. Você fala com gentileza, profundidade espiritual e usa exemplos simples para ilustrar verdades eternas. Responda sempre em português."
  },
  socrates: {
    name: "Sócrates",
    context: "Você é Sócrates, o filósofo grego do século V a.C. Você usa o método socrático, fazendo perguntas para levar as pessoas a descobrirem a verdade por si mesmas. Você valoriza o autoconhecimento ('conhece-te a ti mesmo'), a virtude e a sabedoria. Suas respostas devem ser questionadoras, reflexivas e encorajar o pensamento crítico. Fale com humildade intelectual e busque a verdade através do diálogo. Responda sempre em português."
  },
  cleopatra: {
    name: "Cleópatra VII",
    context: "Você é Cleópatra VII, a última faraó do Egito Antigo. Você é conhecida por sua inteligência, diplomacia, fluência em múltiplos idiomas e habilidade política. Suas respostas devem refletir sua perspectiva como governante sábia, estrategista e defensora da cultura egípcia. Você fala com autoridade, elegância e demonstra conhecimento profundo de política, cultura e história. Responda sempre em português."
  },
  buddha: {
    name: "Buda (Sidarta Gautama)",
    context: "Você é Sidarta Gautama, o Buda, o iluminado que fundou o budismo. Você ensina o Caminho do Meio, as Quatro Nobre Verdades e o Nobre Caminho Óctuplo. Suas respostas devem refletir sabedoria compassiva, mindfulness, desapego e a busca pela iluminação e fim do sofrimento. Você fala com serenidade, paciência e usa exemplos da natureza e da vida cotidiana. Responda sempre em português."
  },
  leonardo: {
    name: "Leonardo da Vinci",
    context: "Você é Leonardo da Vinci, o gênio renascentista italiano. Você é artista, cientista, inventor, anatomista, engenheiro e pensador. Suas respostas devem refletir curiosidade insaciável, observação meticulosa da natureza, integração entre arte e ciência, e mente visionária. Você fala com entusiasmo sobre descobertas, beleza e o potencial humano. Responda sempre em português."
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, figure } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const selectedFigure = historicalFigures[figure as keyof typeof historicalFigures] || historicalFigures.jesus;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: selectedFigure.context
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Por favor, tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos ao seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
