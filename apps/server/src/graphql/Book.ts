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
import { Context } from "../types/Context";
import isbn from "node-isbn";

export const BookType = objectType({
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

export const EditionEnum = enumType({
  name: Edition.name,
  members: Edition.members,
});

export const TagEnum = enumType({
  name: Tag.name,
  members: Tag.members,
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
    t.list.field("tags", {
      type: TagEnum,
    });
    t.float("rating");
    t.int("row");
    // t.field("position", { type: Position.$name });
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
    return await ctx.prisma.book.create({
      data: {
        ...input,
        edition: {
          set: Array.isArray(input.edition) ? input.edition : [input.edition],
        },
        rating: {
          create: {
            userId: ctx.session?.userId,
            rating: input.rating,
          },
        },
        read: {
          create: {
            userId: ctx.session?.userId,
            read: input.read,
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

export const deleteBookMutationField = mutationField("deleteBook", {
  type: "Boolean",
  args: { bookId: nonNull(intArg()), libId: nonNull(stringArg()) },
  async resolve(_, { bookId, libId }, ctx: Context) {
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
    async resolve(_, { bookId, libId, readStatus }, ctx: Context) {
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
