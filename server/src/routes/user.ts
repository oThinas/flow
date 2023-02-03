import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { schemaParser } from '../utils/schemaParser';

/**
 * This function is used to get all users from a database using the express.Application and
 * PrismaClient objects.

 * @param {express.Application} app - Express application instance.
 * @param {PrismaClient} prisma - Prisma client instance.

 * @description It sets up a GET request for '/users' which will return an object containing up
 * to 20 users from the database. If no users are found, it will send a 404 status code with the
 * message **'Nenhum usuário cadastrado.'**.
 */
function getAll(app: express.Application, prisma: PrismaClient): void {
  app.get('/users', async (_request, response) => {
    try {
      const users = await prisma.user.findMany({ take: 20 });
      if (!users.length) throw new Error('Nenhum usuário cadastrado.');

      return response.send({ users });
    } catch (error: any) {
      return response.status(404).send(error.message);
    }
  });
}

/**
 * This function is used to get a user by their id.
 * @param {express.Application} app - Express application instance.
 * @param {PrismaClient} prisma - Prisma client instance.

 * @description It takes the ```id``` from the request parameters, verify if it is a number.
 * If not, it sends and error message with a status code 404 and message **'O parâmetro da
 * requisição (id) deve ser um número.'**. If ```id``` is a numeric string, it tries to find
 * a user with that id using the Prisma client. If it finds one, it sends the user object in
 * the response, otherwise it sends an error message with a status code of 404 and message
 * **'Nenhum usuário cadastrado.'**.
 */
function getById(app: express.Application, prisma: PrismaClient): void {
  app.get('/user/:id', async (request, response) => {
    const { id } = request.params;

    try {
      if (isNaN(Number(id))) throw new Error('O parâmetro da requisição (id) deve ser um número.');
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) throw new Error('Nenhum usuário encontrado.');

      return response.send({ user });
    } catch (error: any) {
      return response.status(404).send(error.message);
    }
  });
}

/**
 * This function is used to get a user by query.
 * @param {express.Application} app - Express application instance.
 * @param {PrismaClient} prisma - Prisma client instance.

 * @description It takes the id from the request parameters and tries to find a user with that
 * id using the Prisma client. If it finds, it sends the user object in the response, otherwise
 * it sends an error message with a status code of 404 status code with the message **'Nenhum
 * usuário cadastrado.'**. If no query is provided, it sends an error message with a status code
 * of 400 status code with the message **'Nenhum parâmetro válido foi informado. Favor, informar
 * "name", "login" ou "email".'**
 */
function getByQuery(app: express.Application, prisma: PrismaClient): void {
  app.get('/user', async (request, response) => {
    const { name, login, email } = request.query;
    if (!name && !login && !email) {
      return response.status(400).send('Nenhum parâmetro válido foi informado. Favor, informar "name", "login" ou "email".');
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: String(name) },
            { login: String(login) },
            { email: String(email) },
          ],
        },
      });

      if (!user) throw new Error('Usuário não encontrado.');

      return response.send({ user });
    } catch (error: any) {
      return response.status(404).send(error.message);
    }
  });
}

/**
 * This function is used to create a user.
 * @param {express.Application} app - Express application instance.
 * @param {PrismaClient} prisma - Prisma client instance.

 * @description It contains a asynchoronous function ```validatePost``` for validating the request
 * body. If it isn't valid, ```isPostValid``` will be ```false``` and the function will return. If
 * it is valid, a user will be created using ```userData```.

 * @see ```validatePost``` for more information.
 */
function post(app: express.Application, prisma: PrismaClient): void {
  app.post('/user', async (request, response) => {
    const { isPostValid } = await validatePost(request, response, prisma);
    if (!isPostValid) return;

    const userData = request.body;
    const user = await prisma.user.create({ data: userData });

    return response.status(201).send(user);
  });
}

/**
 * This function is used to validate a POST request.
 * @param {express.Request} request - Express request object.
 * @param {express.Response} response - Express response object.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns ```{ isPostValid: true }``` if the request body is valid. If not, it returns
 * ```{ isPostValid: false }``` in case of error in the request body. Or it returns
 * ```{ isPostValid: false, error: express.Response }``` in case of error in the database.

 * @description It first checks if all required inputs (name, login, email, and password)
 * have been provided. If not, it sends a 400 status code with the message
 * **'Favor, informar "name", "login", "email" e "password".'**. Then, it builds a regex to
 * validate the password and builds the ```userSchema``` for validating the request body. If
 * the request body isn't valid, it returns ```{ isPostValid: false }```. Then, it checks if
 * the login or email already exists in the database. If it does, it sends a 400 status code
 * with the message **'Login ou email já cadastrado.'**. Passing by all the validations, it
 * returns ```{ isPostValid: true }```.

 * @see ```schemaParser``` for more information.
 */
async function validatePost(
  request: express.Request,
  response: express.Response,
  prisma: PrismaClient,
): Promise<{ isPostValid: boolean } | { error: express.Response, isPostValid: false }> {
  const { name, login, email, password } = request.body;
  if (!name || !login || !email || !password) {
    return {
      error: response.status(400).send('Favor, informar "name", "login", "email" e "password".'),
      isPostValid: false,
    };
  }

  /* Regex for validating password: at least 6 characters, 1 uppercase, 1 lowercase, 1 number
  and 1 special character. */
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const userSchema = z.object({
    name: z.string().trim()
      .min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' })
      .max(50, { message: 'Nome deve ter no máximo 50 caracteres.' }),
    login: z.string().trim()
      .min(4, { message: 'Login deve ter no mínimo 4 caracteres.' })
      .max(20, { message: 'Login deve ter no máximo 20 caracteres.' }),
    email: z.string().trim()
      .email({ message: 'Email inválido.' }),
    password: z.string().trim()
      .regex(passwordRegex, { message: 'Senha deve conter no mínimo 6 caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' }),
  });

  const { isPostValid } = schemaParser(request, 'body', response, userSchema, 'isPostValid');
  if (!isPostValid) return { isPostValid: false };

  try {
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { login },
          { email },
        ],
      },
    });
    if (userExists) throw new Error('Usuário com o mesmo login e/ou email já cadastrado.');
  } catch (error: any) {
    return {
      error: response.status(400).send(error.message),
      isPostValid: false,
    };
  }

  return { isPostValid: true };
}

export async function userRoutes(app: express.Application, prisma: PrismaClient): Promise<void> {
  getAll(app, prisma);
  getById(app, prisma);
  getByQuery(app, prisma);
  post(app, prisma);
}
