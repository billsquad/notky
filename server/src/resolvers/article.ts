import { Article } from "../entities/Article";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

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

  @Mutation(() => Article)
  async createArticle(
    // @Arg('title', () => String) title: string,
    @Arg('title', () => String) title: string,
    @Ctx() { em }: MyContext
    ): Promise<Article> {
    const article = em.create(Article, { title })
    await em.persistAndFlush(article);
    return article;
  }

  @Mutation(() => Article, { nullable: true })
  async updateArticle(
    @Arg("id") id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
    ): Promise<Article | null> {
    const article = await em.findOne(Article, { _id: id });
    if (!article) {
      return null;
    }
    if (typeof title !== 'undefined') {
      article.title = title;
      await em.persistAndFlush(article);
    }
    return article;
  }

  @Mutation(() => Boolean)
  async deleteArticle(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
    ): Promise<boolean> {
    em.nativeDelete(Article, { _id: id });
    return true;
  }
}
