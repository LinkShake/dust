import { enumType } from "nexus";
import { Edition, Tag } from "nexus-prisma";

export const EditionEnum = enumType({
  name: Edition.name,
  members: Edition.members,
});

export const TagEnum = enumType({
  name: Tag.name,
  members: Tag.members,
});
