import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Book } from "../entities/Book";
import { Context } from "../context";

@Resolver(Book)
@Authorized()
export class BookResolver {
  @Query(() => [Book])
  async books(@Ctx() ctx: Context): Promise<Book[]> {
    return await ctx.db.getRepository(Book).find();
  }
}
