import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes';
import aiRoutes from '../src/routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas Integradas
app.use('/api/auth', authRoutes); // Ex: POST /api/auth/register
app.use('/api/ai', aiRoutes);     // Ex: POST /api/ai/ask

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', database: 'connected' });
});

app.listen(PORT, () => {
    console.log(`🚀 PC Assistant Server rodando em http://localhost:${PORT}`);
    console.log(`🛠️  Serviço de IA e Banco de Dados ativos.`);
});