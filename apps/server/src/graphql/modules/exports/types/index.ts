import { types as book } from "../../book/index";
import { types as library } from "../../library/index";
import { types as position } from "../../position/index";
import { enums, scalars, paginatedTypes } from "../../shared";

export const graphqlTypes = [
  book.bookType,
  library.libraryType,
  position.libraryPositionType,
  position.positionType,
  enums.EditionEnum,
  enums.TagEnum,
  scalars.jsonScalar,
  paginatedTypes.paginatedBooksType,
];
