import { registerEnumType } from "type-graphql";

export enum Tag {
  FANTASY,
  CONTEMPORARY_LITERATURE,
  ROMANCE,
  DETECTIVE_BOOKS,
  THRILLER,
  HORROR,
  TRUE_STORY,
  PERSONAL_GROUTH,
  HISTORICAL,
}

registerEnumType(Tag, {
  name: "Tag",
});
