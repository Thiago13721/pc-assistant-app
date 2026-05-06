import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/db';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, cep, address } = req.body;

    // Edge case: Verifica se o e-mail já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Este e-mail já está em uso.' });
      return;
    }

    // Segurança: Hash da senha (custo 10 para balancear performance e segurança)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cep,
        address,
      },
    });

    // Remove a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};