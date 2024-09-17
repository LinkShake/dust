import { mutations as bookMutations } from "../../book/index";
import { mutations as libraryMutations } from "../../library/index";

export const graphqlMutations = [
  bookMutations.insertBookMutationField,
  bookMutations.deleteBookMutationField,
  bookMutations.loadBookByIsbnMutationField,
  bookMutations.updateBookRatingMutationField,
  bookMutations.updateBookReadStatusMutationField,
  libraryMutations.createLibraryMutationField,
  libraryMutations.shareLibraryMutationField,
  libraryMutations.deleteLibraryMutationField,
];
