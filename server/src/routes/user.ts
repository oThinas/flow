import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

function getAll(app: express.Application, prisma: PrismaClient) {
  app.get('/users', async (_request, response) => {
    const users = await prisma.user.findMany();

    return response.json(users);
  });
}

function getById(app: express.Application, prisma: PrismaClient) {
  app.get('/user/:id', async (request, response) => {
    const { id } = request.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    return response.json(user);
  });
}

function getByQuery(app: express.Application, prisma: PrismaClient) {
  app.get('/user', async (request, response) => {
    if (Object.keys(request.query).length === 0) return response.status(400).send('Nenhum parâmetro foi informado. Favor, informar "name", "login" ou "email".');
    const { name, login, email }: any = request.query;
    const user = await prisma.user.findFirst({ where: { name, login, email } });

    return response.json(user);
  });
}

function post(app: express.Application, prisma: PrismaClient) {
  app.post('/user', async (request, response) => {
    if (Object.keys(request.body).length !== ['name', 'login', 'email', 'password'].length) return response.status(400).send('Nenhum parâmetro foi informado. Favor, informar "name", "login", "email" e "password".');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const userSchema = z.object({
      name: z.string()
        .min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' })
        .max(50, { message: 'Nome deve ter no máximo 50 caracteres.' }),
      login: z.string()
        .min(4, { message: 'Login deve ter no mínimo 4 caracteres.' })
        .max(20, { message: 'Login deve ter no máximo 20 caracteres.' }),
      email: z.string().email({ message: 'Email inválido.' }),
      password: z.string()
        .regex(passwordRegex, { message: 'Senha deve conter no mínimo 6 caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' }),
    });

    try {
      userSchema.parse(request.body);
    } catch (error: any) {
      const errorsMessage = error.issues.map((issue: { path: string[], message: string}) => {
        return {
          field: issue.path[0],
          message: issue.message,
        };
      });
      return response.status(400).send({ errorsMessage });
    }

    const { name, login, email, password } = request.body;

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { login },
          { email },
        ],
      },
    });

    if (userExists) return response.status(400).send('Usuário com o mesmo login e/ou email já cadastrado.');
    const user = await prisma.user.create({ data: { name, login, email, password } });

    return response.status(201).json(user);
  });
}

export const user = { getAll, getById, getByQuery, post };
