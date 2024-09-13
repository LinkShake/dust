import { FieldNode } from "graphql";

export const doesQueryContaindFields = (
  fieldNodes: readonly FieldNode[],
  fields: string[]
): boolean => {
  if (!fieldNodes) return false;

  const doesFieldExist = fieldNodes.some(
    (currField) => currField.name.value === fields[0]
  );

  if (!doesFieldExist) {
    return false;
  }

  if (fields.length === 1) {
    return true;
  }

  return doesQueryContaindFields(fieldNodes, fields.slice(1));
};
