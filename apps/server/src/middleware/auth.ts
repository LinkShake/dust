import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { Context } from "../types/Context";

export const isAuth = async (
  resolve: Function,
  root: any,
  args: any,
  context: Context,
  info: GraphQLResolveInfo
) => {
  if (!context.session?.userId) {
    throw new GraphQLError("Unauthorized user", {
      extensions: {
        code: "UNAUTHORIZED_USER",
      },
    });
  }

  return await resolve(root, args, context, info);
};
