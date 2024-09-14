import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const redis = createClient();
  await redis.connect();
  const { sid } = req.cookies;
  if (!sid) {
    res.redirect("/auth/github");
    return;
  }
  const userId = (await redis.get(`dust_${sid}`)) as string;
  if (!userId) {
    res.redirect("/auth/github");
    return;
  }

  next();
};
