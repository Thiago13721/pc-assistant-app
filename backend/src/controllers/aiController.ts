import { Request, Response } from 'express';
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export const askAI = async (req: Request, res: Response): Promise<void> => {
    const { category, query, budget, tier } = req.body;

    console.log(`\n📡 Novo pedido recebido!`);
    console.log(`📂 Categoria: ${category}`);
    console.log(`💬 Pergunta: ${query || "Nenhuma"}`);
    console.log(`💰 Orçamento: ${budget || "Não informado"}`);
    console.log(`🖥️  Tier: ${tier || "Não informado"}`);
    console.log(`🤖 Chamando AI Engine: ${AI_ENGINE_URL}`);

    try {
        const response = await axios.post(`${AI_ENGINE_URL}/ask-ai`, {
            category,
            query:  query  || "",
            budget: budget || "",
            tier:   tier   || "",
        }, { timeout: 60000 }); // 60s — Gemini pode demorar

        console.log("✅ Resposta da IA recebida com sucesso.");
        res.json({ answer: response.data.answer });

    } catch (err: any) {
        const status  = err?.response?.status;
        const message = err?.response?.data?.detail || err?.message || "Erro desconhecido";

        console.error(`❌ Erro ao contatar AI Engine (${status}): ${message}`);

        if (status === 503) {
            res.status(503).json({ error: "Motor de IA sobrecarregado. Tente novamente." });
        } else {
            res.status(500).json({ error: "Erro interno no motor de IA", detail: message });
        }
    }
};