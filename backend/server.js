const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.post('/ask-ai', (req, res) => {
    const { category, query, budget, tier } = req.body;
 
    console.log(`\n📡 Novo pedido recebido!`);
    console.log(`📂 Categoria: ${category}`);
    console.log(`💬 Pergunta: ${query || "Nenhuma"}`);
    console.log(`💰 Orçamento: ${budget || "Não informado"}`);
    console.log(`🖥️  Tier: ${tier || "Não informado"}`);
 
    const pythonPath = path.join(__dirname, '../ai_engine/venv/Scripts/python.exe');
    const scriptPath = path.join(__dirname, '../ai_engine/main.py');
 
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
        errorOutput += data.toString();
        if (data.toString().includes('[FALLBACK]')) {
            console.warn(`⚠️  ${data.toString().trim()}`);
        }
    });
 
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Erro no processo Python: ${errorOutput}`);
            return res.status(500).json({ error: "Erro interno no motor de IA" });
        }
 
        const trimmed = result.trim();
 
        if (!trimmed || trimmed.startsWith("Erro:")) {
            console.error(`❌ IA retornou erro: ${trimmed}`);
            return res.status(503).json({ error: trimmed || "Serviço indisponível" });
        }
 
        console.log("✅ Resposta da IA capturada com sucesso!");
        res.json({ answer: trimmed });
    });
});
 
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR BACKEND ATIVO`);
    console.log(`🔗 Endpoint: http://localhost:${PORT}/ask-ai`);
    console.log(`🟢 Aguardando conexões do App Mobile...\n`);
})