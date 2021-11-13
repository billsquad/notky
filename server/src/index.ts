import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Article } from "./entities/Article";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const article = orm.em.create(Article, { title: "new article" });
  await orm.em.persistAndFlush(article);
};

main().catch((err) => {
  console.error(err);
});
