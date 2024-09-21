import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
// import { makeSchema } from "nexus";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
// @ts-ignore
import cookieEncrypter from "cookie-encrypter";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import { v4 as uuidv4 } from "uuid";
// import { applyMiddleware } from "graphql-middleware";
// import { isAuth } from "./middleware/auth";
// import path from "path";
import { cookieOpts } from "./constants";
import { db } from "./db";
// import path from "path";
import { UserResolver } from "./resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers/BookResolver";
import { Stats, User } from "./entities/User";
import { isAuth } from "./middleware/auth";
// import { Book } from "./entities/Book";

const main = async () => {
  const app = express();
  const redis = createClient();
  await redis.connect();

  await db.initialize();

  // await db.runMigrations();

  const schema = await buildSchema({
    resolvers: [UserResolver, BookResolver],
    validate: false,
    emitSchemaFile: true,
    authChecker: isAuth,
  });

  // const schema = makeSchema({
  //   types: [graphqlTypes, graphqlInputs, graphqlQueries, graphqlMutations],
  //   outputs: { schema: true },
  //   contextType: {
  //     module: path.join(__dirname, "context.ts"),
  //     export: "Context",
  //   },
  // });

  // const schemaWithMiddleware = applyMiddleware(schema, isAuth);

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

        let user = await db.getRepository(User).findOne({
          where: {
            githubId: `${githubId}`,
          },
        });

        if (!user) {
          user = new User();
          user.githubId = `${githubId}`;
          user.favorites = [];
          user.libraries = [];
          const stats = new Stats();
          user.stats = stats;
          await user.save();
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
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const { sid } = req.cookies;
        const userId = (await redis.get(`dust_${sid}`)) as string;

        return {
          req,
          res,
          db,
          session: { userId },
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
      const typedUser = (req.user as { id: string }).id;
      await redis.set(`dust_${sid}`, typedUser);
      res.cookie("sid", sid, cookieOpts);
      // Successful authentication, redirect home.
      res.redirect("/graphql");
    }
  );

  app.listen(8000);
};

main().catch((err) => console.log(err));
