import { Article } from "../entities/Article";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";

@Resolver()
export class ArticleResolver {
  @Query(() => [Article])
  articles(@Ctx() { em }: MyContext): Promise<Article[]> {
    return em.find(Article, {});
  }

  @Query(() => Article, { nullable: true })
  article(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
    ): Promise<Article | null> {
    return em.findOne(Article, { _id: id });
  }
}
