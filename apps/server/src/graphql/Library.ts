import { objectType, queryField } from "nexus";
import { Library } from "nexus-prisma";
import { Context } from "../types/Context";

export const LibraryType = objectType({
  name: Library.$name,
  definition(t) {
    t.field("id", { type: Library.id.type });
    t.field("ownerId", { type: Library.ownerId.type });
    t.field("shared", { type: Library.shared.type });
    t.field("sharesId", { type: Library.sharesId.type });
    t.field("books", {
      type: Library.books.type,
      resolve: async (parent, _, ctx: Context) => {
        return await ctx.prisma.book.findMany({
          where: {
            libraryId: parent.id,
          },
        });
      },
    });
  },
});

export const librariesQueryField = queryField((t) => {
  t.nonNull.list.nonNull.field("libraries", {
    type: Library.$name,
    async resolve(_, __, ctx: Context) {
      const data = await ctx.prisma.library.findMany();
      console.log(data);
      return data;
    },
  });
});
