// @ts-nocheck
export const getNonEmptyFields = (bookData: Object) => {
  const nonEmptyMap = {};

  Object.entries(bookData).map(([key, value], idx) => {
    console.log(key, value);
  });
};
