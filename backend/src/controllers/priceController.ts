import { Request, Response } from 'express';
import axios from 'axios';

export const getProductPrice = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.params;

  try {
    const response = await axios.get<any>(
  `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query as string)}&limit=5&access_token=${process.env.ML_ACCESS_TOKEN}`,
  {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'axios/1.15.2',
    },
    timeout: 8000,
  }
);

    const results = response.data.results;

    if (!results || results.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    const prices = results
      .map((r: any) => r.price as number)
      .filter((p: number) => p > 0)
      .sort((a: number, b: number) => a - b);

    const median = prices[Math.floor(prices.length / 2)];

    res.json({ price: median, source: 'mercadolivre' });
  } catch (error) {
    console.error('Erro ao buscar preço ML:', error);
    res.status(500).json({ error: 'Erro ao buscar preço' });
  }
};