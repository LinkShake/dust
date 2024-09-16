import { scalarType } from "nexus";

export const jsonScalar = scalarType({
  name: "JSON",
  asNexusMethod: "json",
});
