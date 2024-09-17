import {
  booleanArg,
  enumType,
  floatArg,
  inputObjectType,
  intArg,
  mutationField,
  nonNull,
  queryField,
  stringArg,
} from "nexus";
import { Book, Edition, Tag } from "nexus-prisma";
import { Context } from "../context";
import isbn from "node-isbn";
import { GraphQLError } from "graphql";
import { paginatedBooksType } from "./shared/booksPagination";

export const EditionEnum = enumType({
  name: Edition.name,
  members: Edition.members,
});

export const TagEnum = enumType({
  name: Tag.name,
  members: Tag.members,
});

export const PositionInputType = inputObjectType({
  name: "PositionInputType",
  definition(t) {
    t.int("shelf");
    t.string("libName");
    t.int("libNum");
  },
});

export const BookInputType = inputObjectType({
  name: "BookInputType",
  definition(t) {
    t.nonNull.string("libraryId");
    t.nonNull.string("title");
    t.nonNull.string("author");
    t.string("description");
    t.string("publisher");
    t.int("pages");
    t.field("position", { type: PositionInputType });
    t.list.field("tags", {
      type: TagEnum,
    });
    t.float("rating");
    t.int("row");
    t.string("lang");
    t.boolean("read");
    t.list.field("edition", {
      type: EditionEnum,
    });
    t.float("price");
    t.string("buyLink");
    t.boolean("gifted");
  },
});

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
      if (first <= 0) {
        throw new GraphQLError("Invalid pagination param `first`");
      }

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

      if (first > booksCount) {
        throw new GraphQLError("Invalid pagination param `first`");
      }

      const parsedCursor = +Buffer.from(after, "base64").toString();

      const data =
        after !== ""
          ? await ctx.prisma.book.findMany({
              where: {
                libraryId,
              },
              take: first,
              skip: 1,
              cursor: {
                id: parsedCursor,
              },
            })
          : await ctx.prisma.book.findMany({
              where: {
                libraryId,
              },
              take: first,
            });

      return {
        edges: data.map((currBook) => {
          return {
            cursor: Buffer.from(JSON.stringify(currBook.id)).toString("base64"),
            node: currBook,
          };
        }),
        pageInfo: {
          cursor: Buffer.from(
            JSON.stringify(data[data.length - 1].id)
          ).toString("base64"),
          hasNextPage: first >= booksCount - data.length - 1 ? false : true,
        },
      };
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

export const insertBookMutationField = mutationField("insertBook", {
  type: Book.$name,
  args: { data: BookInputType },
  async resolve(_, { data: input }, ctx: Context) {
    await ctx.prisma.library.update({
      where: {
        id: input.libraryId,
      },
      data: {
        booksCount: {
          increment: 1,
        },
      },
    });

    return await ctx.prisma.book.create({
      data: {
        ...input,
        edition: {
          set: Array.isArray(input.edition)
            ? input.edition
            : input.edition
              ? [input.edition]
              : [],
        },
        rating: {
          create: {
            userId: ctx.session?.userId,
            rating: input.rating || 0.0,
          },
        },
        read: {
          create: {
            userId: ctx.session?.userId,
            read: input.read ?? false,
          },
        },
        position: {
          create: {
            shelf: input.position.shelf,
            libraryPosition: {
              create: {
                libraryName: input.position.libName,
                libraryNumber: input.position.libNum,
              },
            },
          },
        },
      },
    });
  },
});

export const insertBookByIsbnMutationField = mutationField("insertBookByIsbn", {
  type: "Boolean",
  args: { isbn: nonNull(stringArg()) },
  async resolve(_, { isbn: userIsbn }, __) {
    isbn.provider(["google"]).resolve(userIsbn, (_: any, book: any) => {
      console.log(book);
    });
    return true;
  },
});

export const loadBookByIsbnMutationField = mutationField("loadBookByIsbn", {
  type: "JSON",
  args: { isbn: nonNull(stringArg()) },
  async resolve(_, { isbn: userIsbn }, __) {
    return await isbn.resolve(userIsbn);
  },
});

export const deleteBookMutationField = mutationField("deleteBook", {
  type: "Boolean",
  args: { bookId: nonNull(intArg()), libId: nonNull(stringArg()) },
  async resolve(_, { bookId, libId }, ctx: Context) {
    await ctx.prisma.library.update({
      where: {
        id: libId,
      },
      data: {
        booksCount: {
          decrement: 1,
        },
      },
    });

    await ctx.prisma.book.delete({
      where: {
        id: bookId,
        libraryId: libId,
      },
    });

    return true;
  },
});

export const updateBookRatingMutationField = mutationField("updateBookRating", {
  type: "Float",
  args: {
    bookId: nonNull(intArg()),
    libId: nonNull(stringArg()),
    newRating: nonNull(floatArg()),
  },
  async resolve(_, { bookId, libId, newRating }, ctx: Context) {
    await ctx.prisma.book.update({
      where: {
        id: bookId,
        libraryId: libId,
      },
      data: {
        rating: {
          update: {
            where: {
              userId: ctx.session?.userId!,
              userId_bookId: { userId: ctx.session?.userId!, bookId },
            },
            data: {
              rating: newRating,
            },
          },
        },
      },
    });

    return newRating;
  },
});

export const updateBookReadStatusMutationField = mutationField(
  "updateBookReadStatus",
  {
    type: "Boolean",
    args: {
      bookId: nonNull(intArg()),
      libId: nonNull(stringArg()),
      readStatus: nonNull(booleanArg()),
    },
    async resolve(_, { bookId, libId, readStatus }, ctx) {
      await ctx.prisma.book.update({
        where: {
          id: bookId,
          libraryId: libId,
        },
        data: {
          read: {
            update: {
              where: {
                userId: ctx.session?.userId!,
                userId_bookId: { userId: ctx.session?.userId!, bookId },
              },
              data: {
                read: readStatus,
              },
            },
          },
        },
      });

      return readStatus;
    },
  }
);
