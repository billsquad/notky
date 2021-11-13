import { MikroORM } from "@mikro-orm/core";
import path from "path";

import { __prod__ } from "./constants";
import { Article } from "./entities/Article";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Article],
  dbName: "notky",
  password: "postgres123",
  type: "postgresql",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
