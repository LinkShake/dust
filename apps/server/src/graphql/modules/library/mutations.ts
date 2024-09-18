import { GraphQLError } from "graphql";
import { mutationField, nonNull, stringArg, list } from "nexus";
import { Library } from "nexus-prisma";
import { Context } from "../../../context";

export const createLibraryMutationField = mutationField("createLibrary", {
  type: Library.$name,
  args: { libName: nonNull(stringArg()) },
  async resolve(_, { libName }, ctx: Context) {
    return await ctx.prisma.library.create({
      data: {
        name: libName,
        ownerId: ctx.session?.userId!,
        shared: false,
        sharesId: [],
        books: { create: [] },
        info: {
          create: {
            members: {
              connect: {
                userId: ctx.session.userId,
              },
            },
          },
        },
      },
    });
  },
});

export const shareLibraryMutationField = mutationField("shareLibrary", {
  type: "Boolean",
  args: { usersId: nonNull(list(stringArg())), libId: nonNull(stringArg()) },
  async resolve(_, { usersId, libId }, ctx: Context) {
    await ctx.prisma.library.update({
      where: {
        id: libId,
      },
      data: {
        shared: true,
        sharesId: {
          push: usersId,
        },
      },
    });

    return true;
  },
});

export const deleteLibraryMutationField = mutationField("deleteLibrary", {
  type: "Boolean",
  args: { libId: nonNull(stringArg()) },
  async resolve(_, { libId }, ctx: Context) {
    const library = await ctx.prisma.library.findUnique({
      where: {
        id: libId,
      },
    });

    if (ctx.session?.userId !== library?.ownerId) {
      throw new GraphQLError("Permission denied", {
        extensions: {
          code: "UNAUTHORIZED",
        },
      });
    }

    await ctx.prisma.book.deleteMany({
      where: {
        libraryId: libId,
      },
    });

    await ctx.prisma.library.delete({
      where: {
        id: libId,
      },
    });

    return true;
  },
});
