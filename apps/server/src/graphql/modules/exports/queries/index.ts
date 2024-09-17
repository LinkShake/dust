import { queries as bookQueries } from "../../book/index";
import { queries as libraryQueries } from "../../library/index";

export const graphqlQueries = [
  bookQueries.paginatedBooksQueryField,
  bookQueries.bookByIdQueryField,
  libraryQueries.librariesQueryField,
];
