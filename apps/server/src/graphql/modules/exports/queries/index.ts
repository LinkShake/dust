import { queries as bookQueries } from "../../book";
import { queries as libraryQueries } from "../../library";
import { queries as userQueries } from "../../user";

export const graphqlQueries = [
  userQueries.userQueryField,
  bookQueries.paginatedBooksQueryField,
  bookQueries.bookByIdQueryField,
  libraryQueries.librariesQueryField,
];
