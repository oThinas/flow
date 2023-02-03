import express from 'express';
import { PrismaClient } from '@prisma/client';

import { userRoutes } from './routes/user';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

/** User */
userRoutes(app, prisma);

app.listen(3000);
