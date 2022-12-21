import express from 'express';
import { PrismaClient } from '@prisma/client';

import { user } from './routes/user';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

/** User */
user.getAll(app, prisma);
user.getById(app, prisma);
user.getByQuery(app, prisma);
user.post(app, prisma);

app.listen(3000);
