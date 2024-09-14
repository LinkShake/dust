import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { prisma } from "../prisma/db";
import DataLoader from "dataloader";
import { makeSchema } from "nexus";
import {
  createLibraryMutationField,
  deleteLibraryMutationField,
  librariesQueryField,
  LibraryType,
  shareLibraryMutationField,
} from "./graphql/Library";
import {
  insertBookMutationField,
  BookType,
  EditionEnum,
  booksQueryField,
  bookByIdQueryField,
  insertBookByIsbnMutationField,
  deleteBookMutationField,
  updateBookRatingMutationField,
  updateBookReadStatusMutationField,
} from "./graphql/Book";
import { LibraryPositionType, PositionType } from "./graphql/Position";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
// @ts-ignore
import cookieEncrypter from "cookie-encrypter";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import { v4 as uuidv4 } from "uuid";
// import { GraphQLError } from "graphql";
// import { isAuth } from "./middleware/auth";

const main = async () => {
  const app = express();
  const redis = createClient();
  await redis.connect();

  const schema = makeSchema({
    types: [
      LibraryType,
      librariesQueryField,
      createLibraryMutationField,
      shareLibraryMutationField,
      deleteLibraryMutationField,
      BookType,
      booksQueryField,
      bookByIdQueryField,
      insertBookMutationField,
      insertBookByIsbnMutationField,
      deleteBookMutationField,
      updateBookRatingMutationField,
      updateBookReadStatusMutationField,
      PositionType,
      LibraryPositionType,
      EditionEnum,
    ],
    outputs: { schema: true },
  });

  const server = new ApolloServer({ schema });

  await server.start();

  app.use(cookieParser(process.env.COOKIE_SECRET!));
  app.use(cookieEncrypter(process.env.COOKIE_SECRET!));

  app.use(passport.initialize());

  passport.use(
    new GitHubStrategy.Strategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: "http://localhost:8000/auth/github/callback",
      },
      // @ts-ignore
      async (_accessToken, _refreshToken, profile, done) => {
        // 1. grab id
        const githubId = profile._json.id as string;

        let user = await prisma.user.findUnique({
          where: {
            githubId: `${githubId}`,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              githubId: `${githubId}`,
              libraries: { create: [] },
              stats: { create: {} },
              wishlist: { create: [] },
            },
          });
        }

        // 4. return user
        done(null, user);
      }
    ) as any
  );

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    async (req, res, next) => {
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
      const user = await prisma.user.findUnique({
        where: {
          userId,
        },
      });
      if (!user) {
        res.redirect("/auth/github");
        return;
      }
      res.locals.user = user;

      next();
    },
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          req,
          res,
          prisma,
          user: res.locals.user,
          bookLoader: new DataLoader(async (keys) => {
            const books = await prisma.book.findMany({
              where: {
                libraryId: {
                  in: keys as string[],
                },
              },
            });

            const bookMap = {} as any;
            books.forEach((book) => {
              bookMap[book.id] = book;
            });
            return (keys as string[]).map((key) => bookMap[key]);
          }),
        };
      },
    })
  );

  app.get("/login", (_, res) => {
    res.send("something went wrong in the auth flow");
  });

  app.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"], session: false })
  );

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", {
      failureRedirect: "/login",
      session: false,
    }),
    async (req, res) => {
      const sid = uuidv4();
      const typedUser = (req.user as { userId: string }).userId;
      await redis.set(`dust_${sid}`, typedUser);
      res.cookie("sid", sid);
      // Successful authentication, redirect home.
      res.redirect("/graphql");
    }
  );

  app.listen(8000);
};

main().catch((err) => console.log(err));
