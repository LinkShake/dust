import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { prisma } from "../prisma/db";
import DataLoader from "dataloader";
import { makeSchema } from "nexus";
import { LibraryType } from "./graphql/Library";
import { BookMutation, BookType, EditionEnum } from "./graphql/Book";
import { Query } from "./graphql/Query";

const main = async () => {
  const app = express();

  const schema = makeSchema({
    types: [LibraryType, BookType, BookMutation, Query, EditionEnum],
    outputs: { schema: true },
  });

  const server = new ApolloServer({ schema });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          req,
          res,
          prisma,
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

  app.listen(8000);
};

main().catch((err) => console.log(err));
