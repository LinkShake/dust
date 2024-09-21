import { Context } from "../context";
import { AuthChecker } from "type-graphql";

export const isAuth: AuthChecker<Context> = ({ context }, _roles) => {
  if (!context.session?.userId) {
    return false;
  }

  return true; // or 'false' if access is denied
};
