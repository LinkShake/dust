import {
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { Library } from "nexus-prisma";
import { Context } from "../context";
import { GraphQLError } from "graphql";

export const libraryType = objectType({
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
      return await ctx.prisma.library.findMany();
    },
  });
});

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
