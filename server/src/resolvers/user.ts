import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = em.findOne(User, { _id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2 chars",
          },
        ],
      };
    }
    if (options.password.length <= 6) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 6 chars",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    // });
    let user;
    try {
      // INTRODUCE QUERYBUILDER
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
      // await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.details.includes("already exists")) {
        // duplicate username error
        return {
          errors: [
            {
              field: "username",
              message: "username has already been taken",
            },
          ],
        };
      }
    }

    // store user id session
    // set a cookie on the user
    // keep them logged in
    req.session.userId = user._id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "incorrect credentials",
          },
        ],
      };
    }
    const checkPassword = await argon2.verify(user.password, options.password);
    if (!checkPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect credentials",
          },
        ],
      };
    }

    req.session.userId = user._id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((error) => {
        if (error) {
          console.log(error);
          resolve(false);
          return;
        }

        res.clearCookie(COOKIE);
        resolve(true);
      })
    );
  }
}
