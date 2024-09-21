import { Request, Response } from "express";
import { DataSource } from "typeorm";

export interface Context {
  req: Request;
  res: Response;
  db: DataSource;
  session: { userId: string };
}
