import { queries as bookQueries } from "../../book";
import { queries as libraryQueries } from "../../library";

export const graphqlQueries = [
  bookQueries.paginatedBooksQueryField,
  bookQueries.bookByIdQueryField,
  libraryQueries.librariesQueryField,
];
