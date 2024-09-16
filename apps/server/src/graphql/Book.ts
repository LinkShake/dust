import {
  booleanArg,
  enumType,
  floatArg,
  inputObjectType,
  intArg,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { Book, Edition, Tag } from "nexus-prisma";
import { Context } from "../context";
import isbn from "node-isbn";
import { GraphQLError } from "graphql";

export const bookType = objectType({
  name: Book.$name,
  definition(t) {
    t.field(Book.id), t.field("title", { type: Book.title.type });
    t.field("author", { type: Book.author.type });
    t.field("ISBN", {
      type: "Int",
    });
    t.field("buyLink", { type: Book.buyLink.type });
    t.field("description", { type: Book.description.type });
    t.field("edition", { type: Book.edition.type });
    t.field("gifted", { type: Book.gifted.type });
    t.field("lang", { type: Book.lang.type });
    t.field("position", { type: Book.position.type });
    t.field("read", {
      type: "Boolean",
      resolve: async (parent, _, ctx: Context) => {
        const data = await ctx.prisma.book.findUnique({
          where: {
            id: parent.id,
          },
          include: {
            read: {
              where: {
                userId: ctx.session?.userId,
              },
            },
          },
        });

        return data?.read.length ? data.read[0].read : false;
      },
    });
    t.field("rating", {
      type: "Float",
      resolve: async (parent, _, ctx: Context) => {
        const data = await ctx.prisma.book.findUnique({
          where: {
            id: parent.id,
          },
          include: {
            rating: {
              where: {
                userId: ctx.session?.userId,
              },
            },
          },
        });

        return data?.rating.length ? data.rating[0].rating : 0.0;
      },
    });
  },
});

export const paginatedBookType = objectType({
  name: "PaginatedBookInfo",
  definition(t) {
    t.nonNull.string("cursor");
    t.nonNull.field("node", {
      type: bookType,
    });
  },
});

export const pageInfoType = objectType({
  name: "PageInfo",
  definition(t) {
    t.nonNull.string("cursor");
    t.nonNull.boolean("hasNextPage");
  },
});

export const paginatedBooksType = objectType({
  name: "PaginatedBooks",
  definition(t) {
    t.nonNull.list.field("edges", {
      type: paginatedBookType,
    });
    t.nonNull.field("pageInfo", {
      type: pageInfoType,
    });
  },
});

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
      after;
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

      const data = await ctx.prisma.book.findMany({
        where: {
          libraryId,
        },
        take: first + 1,
      });

      return {
        edges: data.slice(0, first).map((currBook, idx) => {
          return {
            cursor: idx === booksCount - 1 ? "" : data[idx + 1].id,
            node: currBook,
          };
        }),
        pageInfo: {
          cursor: first === booksCount ? "" : data[first].id,
          hasNextPage: first === booksCount ? false : true,
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
