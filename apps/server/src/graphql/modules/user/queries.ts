import { queryField } from "nexus";
import { userType } from "./types";
import { Context } from "../../../context";

export const userQueryField = queryField("user", {
  type: userType,
  async resolve(_, __, ctx: Context) {
    return await ctx.prisma.user.findUnique({
      where: {
        userId: ctx.session.userId,
      },
    });
  },
});
