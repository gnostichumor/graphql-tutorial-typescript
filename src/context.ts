//This creates the context object used to attach PrismaClient and GraphQL queries via the context resovler argument.
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
}

export const context: Context = {
    prisma,
}