import { Query, Resolver } from "type-graphql";

@Resolver()
export class InitResolver {
  @Query(() => String)
  hello() {
    return "hello world";
  }
}
