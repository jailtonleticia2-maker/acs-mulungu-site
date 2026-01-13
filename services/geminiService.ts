import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NewsItem } from "../types";

/**
 * Inicializa o Gemini com chave do Vite
 * .env.local:
 * VITE_GEMINI_API_KEY=SUACHAVE
 */
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

/**
 * Busca notícias de saúde pública usando Gemini
 * Retorna no formato NewsItem usado no app
 */
export const fetchHealthNews = async (): Promise<NewsItem[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Gere 5 notícias sobre saúde pública no Brasil.

Retorne APENAS um JSON válido, SEM TEXTO EXTRA, no formato exato abaixo:

[
  {
    "title": "Título da notícia",
    "summary": "Resumo curto da notícia",
    "content": "Texto completo da notícia com mais detalhes",
    "date": "2026-01-13",
    "url": "https://exemplo.com/noticia"
  }
]

Regras:
- date no formato YYYY-MM-DD
- url pode ser fictícia, mas válida
- conteúdo em português do Brasil
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Segurança: extrai apenas o JSON
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    return JSON.parse(match[0]) as NewsItem[];
  } catch (error) {
    console.error("Erro ao buscar notícias com Gemini:", error);
    return [];
  }
};
