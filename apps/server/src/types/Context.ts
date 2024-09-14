import { PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

export interface Context {
  req: Request;
  res: Response;
  prisma: PrismaClient<
    {
      log: ("info" | "query" | "warn" | "error")[];
    },
    never,
    DefaultArgs
  >;
  session: { userId: string };
}
