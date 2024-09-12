import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { prisma } from "../prisma/db";
import { Context } from "./types/Context";
import DataLoader from "dataloader";

const typeDefs = `
  type Library {
    id: String!
    name: String!
    ownerId: String!
    shared: Boolean!
    sharesId: [String!]!
    books: [Book]
  }

  type Book {
    id: Int!
    title: String!
    author: String!
    description: String!
    ISBN: Int
    lang: String!
    pages: Int
    publisher: String!
  }

  type Query {
    libraries: [Library]
  }

  type Mutation {
    createLibrary(libName: String!): Boolean
  }
`;

const resolvers = {
  Query: {
    libraries: async (_: any, __: any, ctx: Context) =>
      await ctx.prisma.library.findMany(),
  },
  Library: {
    books: async (parent: any, _: any, ctx: Context) => {
      const loadersData = await ctx.bookLoader.load(parent.id);
      return loadersData || [];
    },
  },
  Mutation: {
    createLibrary: async (_: any, args: any, ctx: Context) => {
      try {
        await ctx.prisma.library.create({
          data: {
            name: args.libName,
            ownerId: "d5001053-43fd-4ace-a0c7-2c790734d08f",
            shared: false,
            sharesId: [],
            books: { create: [] },
          },
        });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
};

const main = async () => {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });

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
