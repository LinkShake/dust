import {
  enumType,
  inputObjectType,
  //   intArg,
  mutationField,
  objectType,
} from "nexus";
import { Book, Edition, Tag } from "nexus-prisma";
import { Context } from "../types/Context";

export const BookType = objectType({
  name: Book.$name,
  definition(t) {
    t.field(Book.id),
      t.field("title", { type: Book.title.type }),
      t.field("author", { type: Book.author.type }),
      t.field("ISBN", {
        type: "Int",
      }),
      t.field("buyLink", { type: Book.buyLink.type }),
      t.field("description", { type: Book.description.type }),
      t.field("edition", { type: Book.edition.type }),
      t.field("gifted", { type: Book.gifted.type }),
      t.field("lang", { type: Book.lang.type });
  },
});

export const EditionEnum = enumType({
  name: Edition.name,
  members: Edition.members,
});

export const TagEnum = enumType({
  name: Tag.name,
  members: Tag.members,
});

export const BookInputType = inputObjectType({
  name: "BookInputType",
  definition(t) {
    t.nonNull.string("libraryId");
    t.nonNull.string("title");
    t.nonNull.string("author");
    t.string("description");
    t.string("publisher");
    t.int("pages");
    t.field("tags", {
      type: TagEnum,
    });
    t.float("rating");
    t.int("row");
    // t.field("position", { type: Book.position.type });
    t.string("lang");
    t.boolean("read");
    t.field("edition", {
      type: EditionEnum,
    });
    t.float("price");
    t.string("buyLink");
    t.boolean("gifted");
  },
});

export const BookMutation = mutationField("insertBook", {
  type: "Boolean",
  args: { data: BookInputType },
  async resolve(_, args, ctx: Context) {
    try {
      const { data: input } = args;
      await ctx.prisma.book.create({
        data: {
          ...input,
          edition: {
            set: Array.isArray(input.edition) ? input.edition : [input.edition],
          },
          rating: {
            create: {
              userId: "d5001053-43fd-4ace-a0c7-2c790734d08f",
              rating: input.rating,
            },
          },
          read: {
            create: {
              userId: "d5001053-43fd-4ace-a0c7-2c790734d08f",
              read: input.read,
            },
          },
        },
      });

      return true;
    } catch (err) {
      return false;
    }
  },
});
