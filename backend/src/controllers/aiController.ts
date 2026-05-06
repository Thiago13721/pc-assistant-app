import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

export const askAI = (req: Request, res: Response): void => {
    const { category, query, budget, tier } = req.body;

    console.log(`\n📡 Novo pedido recebido!`);
    console.log(`📂 Categoria: ${category}`);
    console.log(`💬 Pergunta: ${query || "Nenhuma"}`);
    console.log(`💰 Orçamento: ${budget || "Não informado"}`);
    console.log(`🖥️  Tier: ${tier || "Não informado"}`);

    // Caminhos ajustados: subimos 3 níveis (controllers -> src -> backend -> raiz)
    const pythonPath = path.join(__dirname, '../../../ai_engine/venv/Scripts/python.exe');
    const scriptPath = path.join(__dirname, '../../../ai_engine/main.py');

    const pythonProcess = spawn(
        pythonPath,
        [scriptPath, category, query || "", budget || "", tier || ""],
        { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }
    );

    pythonProcess.stdout.setEncoding('utf-8');
    pythonProcess.stderr.setEncoding('utf-8');

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        const stderrStr = data.toString();
        errorOutput += stderrStr;
        
        // Restaura o aviso de fallback do seu código original
        if (stderrStr.includes('[FALLBACK]')) {
            console.warn(`⚠️  ${stderrStr.trim()}`);
        }
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Erro no processo Python: ${errorOutput}`);
            res.status(500).json({ error: "Erro interno no motor de IA" });
            return;
        }

        const trimmed = result.trim();

        if (!trimmed || trimmed.startsWith("Erro:")) {
            console.error(`❌ IA retornou erro: ${trimmed}`);
            res.status(503).json({ error: trimmed || "Serviço indisponível" });
            return;
        }

        console.log("✅ Resposta da IA capturada com sucesso.");

        // Correção de Segurança (Edge case): 
        // Se o Python devolver um JSON formatado, faz o parse. 
        // Se devolver texto puro (string), empacota no objeto { answer } esperado pelo frontend.
        try {
            const parsed = JSON.parse(trimmed);
            res.json(parsed.answer ? parsed : { answer: parsed });
        } catch (e) {
            res.json({ answer: trimmed });
        }
    });
};