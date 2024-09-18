import { objectType, nonNull, intArg, stringArg } from "nexus";
import { Library } from "nexus-prisma";
import {
  getPaginatedBooks,
  paginatedBooksType,
} from "../shared/pagination/booksPagination";
import { Context } from "../../../context";

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
        const { booksCount } = parent;
        if (!booksCount) return;
        return await getPaginatedBooks(
          { first, after, libraryId: parent.id, booksCount },
          ctx
        );
      },
    });
  },
});
