import { objectType } from "nexus";
import { LibraryPosition, Position } from "nexus-prisma";

export const LibraryPositionType = objectType({
  name: LibraryPosition.$name,
  definition(t) {
    t.field("libraryName", { type: LibraryPosition.libraryName.type });
    t.field("libraryNumber", { type: LibraryPosition.libraryNumber.type });
  },
});

export const PositionType = objectType({
  name: Position.$name,
  definition(t) {
    t.field("shelf", { type: Position.shelf.type });
    t.field("libraryPosition", { type: Position.libraryPosition.type });
  },
});
