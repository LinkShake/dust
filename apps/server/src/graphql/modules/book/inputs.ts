import { inputObjectType } from "nexus";
import { TagEnum, EditionEnum } from "../shared/enums";

export const PositionInputType = inputObjectType({
  name: "PositionInputType",
  definition(t) {
    t.int("shelf");
    t.string("libName");
    t.int("libNum");
  },
});

export const BookInputType = inputObjectType({
  name: "BookInput",
  definition(t) {
    t.nonNull.string("libraryId");
    t.nonNull.string("title");
    t.nonNull.string("author");
    t.string("description");
    t.string("publisher");
    t.int("pages");
    t.field("position", { type: PositionInputType });
    t.list.field("tags", {
      type: TagEnum,
    });
    t.float("rating");
    t.int("row");
    t.string("lang");
    t.boolean("read");
    t.list.field("edition", {
      type: EditionEnum,
    });
    t.float("price");
    t.string("buyLink");
    t.boolean("gifted");
  },
});

export const UpdateBookDataInputType = inputObjectType({
  name: "UpdateBookDataInput",
  definition(t) {
    t.nonNull.string("libraryId");
    t.string("title");
    t.string("author");
    t.string("description");
    t.string("publisher");
    t.int("pages");
    t.field("position", { type: PositionInputType });
    t.list.field("tags", {
      type: TagEnum,
    });
    t.float("rating");
    t.int("row");
    t.string("lang");
    t.boolean("read");
    t.list.field("edition", {
      type: EditionEnum,
    });
    t.float("price");
    t.string("buyLink");
    t.boolean("gifted");
  },
});
