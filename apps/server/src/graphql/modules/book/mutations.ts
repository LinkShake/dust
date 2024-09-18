import {
  mutationField,
  nonNull,
  stringArg,
  intArg,
  floatArg,
  booleanArg,
} from "nexus";
import { Book } from "nexus-prisma";
import { BookInputType, UpdateBookDataInputType } from "./inputs";
import { Context } from "../../../context";
import isbn from "node-isbn";

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
        tags: {
          set: Array.isArray(input.tags)
            ? input.tags
            : input.tags
              ? [input.tags]
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

export const updateBookDataMutationField = mutationField("updateBookData", {
  type: Book.$name,
  args: {
    bookId: nonNull(intArg()),
    data: UpdateBookDataInputType,
  },
  async resolve(_, { bookId, data: input }, ctx: Context) {
    return await ctx.prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        ...input,
        ...(input.edition && {
          edition: {
            set: Array.isArray(input.edition)
              ? input.edition
              : input.edition
                ? [input.edition]
                : [],
          },
        }),
        ...(input.tags && {
          tags: {
            set: Array.isArray(input.tags)
              ? input.tags
              : input.tags
                ? [input.tags]
                : [],
          },
        }),
        ...(input.rating ?? {
          rating: {
            update: {
              where: {
                userId: ctx.session.userId,
                userId_bookId: { bookId, userId: ctx.session.userId },
              },
              data: {
                rating: input.rating,
              },
            },
          },
        }),
        ...(input.read ?? {
          read: {
            update: {
              where: {
                userId: ctx.session.userId,
                userId_bookId: { bookId, userId: ctx.session.userId },
              },
              data: {
                read: input.read,
              },
            },
          },
        }),
        ...(input.position && {
          position: {
            position: {
              update: {
                where: {
                  bookId,
                },
                data: {
                  ...(input.shelf ?? { shelf: input.shelf }),
                  libraryPosition: {
                    update: {
                      data: {
                        ...(input.libraryName && {
                          libraryName: input.libraryName,
                        }),
                        ...(input.libraryNumber ?? {
                          libraryNumber: input.libraryNumber,
                        }),
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      },
    });
  },
});
