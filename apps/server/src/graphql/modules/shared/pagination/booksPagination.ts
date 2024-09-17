import { objectType } from "nexus";
import { bookType } from "../../book/bookType";
import { Context } from "../../../../context";
import { GraphQLError } from "graphql";

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

export const getPaginatedBooks = async (
  {
    first,
    after,
    libraryId,
    booksCount,
  }: { first: number; after: string; libraryId: string; booksCount: number },
  ctx: Context
) => {
  if (first <= 0) {
    throw new GraphQLError("Invalid pagination param `first`");
  }

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

  const hasNextPage = await (async () => {
    if (!after && booksCount > 0) {
      return true;
    }
    const [nextBook] = await ctx.prisma.book.findMany({
      where: {
        libraryId,
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
        cursor: Buffer.from(JSON.stringify(currBook.id)).toString("base64"),
        node: currBook,
      };
    }),
    pageInfo: {
      cursor: Buffer.from(JSON.stringify(data[data.length - 1].id)).toString(
        "base64"
      ),
      hasNextPage,
    },
  };
};
