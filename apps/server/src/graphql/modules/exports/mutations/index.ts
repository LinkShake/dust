import { mutations as bookMutations } from "../../book";
import { mutations as libraryMutations } from "../../library";

export const graphqlMutations = [
  bookMutations.insertBookMutationField,
  bookMutations.deleteBookMutationField,
  bookMutations.loadBookByIsbnMutationField,
  bookMutations.updateBookRatingMutationField,
  bookMutations.updateBookReadStatusMutationField,
  bookMutations.updateBookDataMutationField,
  libraryMutations.createLibraryMutationField,
  libraryMutations.shareLibraryMutationField,
  libraryMutations.deleteLibraryMutationField,
];
