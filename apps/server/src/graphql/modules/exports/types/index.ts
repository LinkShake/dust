import { types as book } from "../../book";
import { types as library } from "../../library";
import { types as position } from "../../position";
import { types as user } from "../../user";
import { enums, scalars, paginatedTypes } from "../../shared";

export const graphqlTypes = [
  user.userType,
  book.bookType,
  library.libraryType,
  position.libraryPositionType,
  position.positionType,
  enums.EditionEnum,
  enums.TagEnum,
  scalars.jsonScalar,
  paginatedTypes.paginatedBooksType,
];
