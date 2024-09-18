import { queryField } from "nexus";
import { Library } from "nexus-prisma";
import { Context } from "../../../context";

export const librariesQueryField = queryField((t) => {
  t.nonNull.list.nonNull.field("libraries", {
    type: Library.$name,
    async resolve(_, __, ctx: Context) {
      return await ctx.prisma.library.findMany();
    },
  });
});
