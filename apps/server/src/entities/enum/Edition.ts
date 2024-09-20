import { registerEnumType } from "type-graphql";

export enum Edition {
  HARDBACK,
  PAPERBACK,
}

registerEnumType(Edition, {
  name: "Edition",
});
