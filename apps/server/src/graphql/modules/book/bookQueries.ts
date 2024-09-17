import { queryField, nonNull, stringArg, intArg } from "nexus";
import { Book } from "nexus-prisma";
import {
  getPaginatedBooks,
  paginatedBooksType,
} from "../shared/pagination/booksPagination";
import { Context } from "../../../context";

export const booksQueryField = queryField((t) => {
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
});

export const paginatedBooksQueryField = queryField((t) => {
  t.nonNull.field("paginatedBooks", {
    type: paginatedBooksType,
    args: {
      first: nonNull(intArg()),
      after: nonNull(stringArg()),
      libraryId: nonNull(stringArg()),
    },
    async resolve(_, { first, after, libraryId }, ctx: Context) {
      const { booksCount } =
        (await ctx.prisma.library.findUnique({
          where: {
            id: libraryId,
          },
          select: {
            booksCount: true,
          },
        })) || {};

      if (!booksCount) return;

      return await getPaginatedBooks(
        { first, after, libraryId, booksCount },
        ctx
      );
    },
  });
});

export const bookByIdQueryField = queryField((t) => {
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
});
