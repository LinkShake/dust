import {
  intArg,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { Library } from "nexus-prisma";
import { Context } from "../context";
import { GraphQLError } from "graphql";
import { paginatedBooksType } from "./modules/shared/pagination/booksPagination";

export const libraryType = objectType({
  name: Library.$name,
  definition(t) {
    t.field("id", { type: Library.id.type });
    t.field("ownerId", { type: Library.ownerId.type });
    t.field("shared", { type: Library.shared.type });
    t.field("sharesId", { type: Library.sharesId.type });
    t.field("books", {
      type: paginatedBooksType,
      args: {
        first: nonNull(intArg()),
        after: nonNull(stringArg()),
      },
      resolve: async (parent, { first, after }, ctx: Context) => {
        if (first <= 0) {
          throw new GraphQLError("Invalid pagination param `first`");
        }

        const { booksCount } = parent;

        if (!booksCount) return;

        if (first > booksCount) {
          throw new GraphQLError("Invalid pagination param `first`");
        }

        const parsedCursor = +Buffer.from(after, "base64").toString();

        const data =
          after !== ""
            ? await ctx.prisma.book.findMany({
                where: {
                  libraryId: parent.id,
                },
                take: first,
                skip: 1,
                cursor: {
                  id: parsedCursor,
                },
              })
            : await ctx.prisma.book.findMany({
                where: {
                  libraryId: parent.id,
                },
                take: first,
              });

        const hasNextPage = await (async () => {
          if (!after && booksCount > 0) {
            return true;
          }
          const [nextBook] = await ctx.prisma.book.findMany({
            where: {
              libraryId: parent.id,
            },
            take: 1,
            skip: 1,
            cursor: {
              id: data[data.length - 1].id,
            },
          });

          if (nextBook) {
            return true;
          }

          return false;
        })();

        return {
          edges: data.map((currBook) => {
            return {
              cursor: Buffer.from(JSON.stringify(currBook.id)).toString(
                "base64"
              ),
              node: currBook,
            };
          }),
          pageInfo: {
            cursor: Buffer.from(
              JSON.stringify(data[data.length - 1].id)
            ).toString("base64"),
            // to fix
            hasNextPage,
          },
        };
      },
    });
  },
});

export const librariesQueryField = queryField((t) => {
  t.nonNull.list.nonNull.field("libraries", {
    type: Library.$name,
    async resolve(_, __, ctx: Context) {
      return await ctx.prisma.library.findMany();
    },
  });
});

export const createLibraryMutationField = mutationField("createLibrary", {
  type: Library.$name,
  args: { libName: nonNull(stringArg()) },
  async resolve(_, { libName }, ctx: Context) {
    return await ctx.prisma.library.create({
      data: {
        name: libName,
        ownerId: ctx.session?.userId!,
        shared: false,
        sharesId: [],
        books: { create: [] },
      },
    });
  },
});

export const shareLibraryMutationField = mutationField("shareLibrary", {
  type: "Boolean",
  args: { usersId: nonNull(list(stringArg())), libId: nonNull(stringArg()) },
  async resolve(_, { usersId, libId }, ctx: Context) {
    await ctx.prisma.library.update({
      where: {
        id: libId,
      },
      data: {
        shared: true,
        sharesId: {
          push: usersId,
        },
      },
    });

    return true;
  },
});

export const deleteLibraryMutationField = mutationField("deleteLibrary", {
  type: "Boolean",
  args: { libId: nonNull(stringArg()) },
  async resolve(_, { libId }, ctx: Context) {
    const library = await ctx.prisma.library.findUnique({
      where: {
        id: libId,
      },
    });

    if (ctx.session?.userId !== library?.ownerId) {
      throw new GraphQLError("Permission denied", {
        extensions: {
          code: "UNAUTHORIZED",
        },
      });
    }

    await ctx.prisma.book.deleteMany({
      where: {
        libraryId: libId,
      },
    });

    await ctx.prisma.library.delete({
      where: {
        id: libId,
      },
    });

    return true;
  },
});
