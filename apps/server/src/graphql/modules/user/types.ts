import { objectType } from "nexus";
import { Genre, Stats, User } from "nexus-prisma";
import { Context } from "../../../context";
import { TagEnum } from "../shared/enums";

export const userType = objectType({
  name: User.$name,
  definition(t) {
    t.field("userId", { type: User.userId.type });
    t.field("githubId", { type: User.githubId.type });
    t.field("stats", {
      type: User.stats.type,
      async resolve(parent, _, ctx: Context) {
        return await ctx.prisma.stats.findUnique({
          where: {
            statsUserId: parent.userId,
          },
        });
      },
    });
    t.field("favorites", {
      type: User.favorites.type,
      async resolve(parent, _, ctx: Context) {
        return await ctx.prisma.book.findMany({
          where: {
            userId: parent.userId,
          },
        });
      },
    });
    t.field("libraries", {
      type: User.libraries.type,
      async resolve(parent, _, ctx: Context) {
        return await ctx.prisma.library.findMany({
          where: {
            OR: [
              { ownerId: parent.userId },
              {
                sharesId: {
                  has: parent.userId,
                },
              },
            ],
          },
        });
      },
    });
  },
});

export const statsType = objectType({
  name: Stats.$name,
  definition(t) {
    t.field("readBooks", { type: Stats.readBooks.type });
    t.field("notReadBooks", { type: Stats.notReadBooks.type });
    t.field("readPages", { type: Stats.readPages.type });
    t.field("totalPages", { type: Stats.totalPages.type });
    t.field("ownedLibraries", { type: Stats.ownedLibraries.type });
    t.field("sharedLibraries", { type: Stats.sharedLibraries.type });
    t.field("genreRead", {
      type: Stats.genreRead.type,
    });
  },
});

export const genreType = objectType({
  name: Genre.$name,
  definition(t) {
    t.field("tag", { type: TagEnum });
    t.field("booksNum", { type: Genre.booksNum.type });
  },
});
