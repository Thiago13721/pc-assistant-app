import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import priceRoutes from './routes/priceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/price', priceRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'connected' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// O Render define NODE_ENV como 'production' automaticamente
const isProduction = process.env.NODE_ENV === 'production';

app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`🚀 ForgePC Backend: ONLINE`);
  console.log(`📡 Ambiente: ${isProduction ? 'PRODUÇÃO (Render)' : 'DESENVOLVIMENTO'}`);
  console.log(`🔌 Porta: ${PORT}`);
  console.log(`🔗 URL: ${isProduction ? 'https://pc-assistant-app-2.onrender.com' : `http://localhost:${PORT}`}`);
  console.log('--------------------------------------------------');
});