import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { ArticleResolver } from "./resolvers/article";
import { InitResolver } from "./resolvers/init";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [InitResolver, ArticleResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(5000, () => {
    console.log("Server is listening at http://localhost:5000");
  });

  // const article = orm.em.create(Article, { title: "new article" });
  // await orm.em.persistAndFlush(article);

  // const articles = await orm.em.find(Article, {});
  // console.log(articles);
};

main().catch((err) => {
  console.error(err);
});
