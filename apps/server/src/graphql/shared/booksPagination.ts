import { objectType } from "nexus";
import { Book } from "nexus-prisma";
import { Context } from "../../context";

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
