import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import connectRedis from "connect-redis";

import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { ArticleResolver } from "./resolvers/article";
import { InitResolver } from "./resolvers/init";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  let RedisStore = connectRedis(session);
  let redisClient = redis.createClient();

  app.use(
    session({
      name: "sessionId",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // protecting from csrf
        secure: __prod__, // set cookie work only for https
      },
      saveUninitialized: false,
      secret: "22daawaadaawaw3d", // random string for now
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [InitResolver, ArticleResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
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
