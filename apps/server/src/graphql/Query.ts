import { intArg, nonNull, queryType, stringArg } from "nexus";
import { Library, Book } from "nexus-prisma";
import { Context } from "vm";

export const Query = queryType({
  definition(t) {
    t.nonNull.list.nonNull.field("libraries", {
      type: Library.$name,
      async resolve(_, __, ctx: Context) {
        return await ctx.prisma.library.findMany();
      },
    });
    t.nonNull.list.nonNull.field("books", {
      type: Book.$name,
      args: {
        libraryId: nonNull(stringArg()),
      },
      async resolve(_, { libraryId }, ctx: Context) {
        return await ctx.prisma.book.findMany({
          where: {
            libraryId,
          },
        });
      },
    });

    t.nonNull.field("book", {
      type: Book.$name,
      args: {
        libraryId: nonNull(stringArg()),
        id: nonNull(intArg()),
      },
      async resolve(_, { libraryId, id }, ctx: Context) {
        return await ctx.prisma.book.findUnique({
          where: {
            libraryId,
            id,
          },
        });
      },
    });
  },
});
