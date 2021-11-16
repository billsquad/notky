import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2';

@InputType()
class UserPasswordInput {
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
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserPasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 2 chars'
        }]
      }
    }
    if (options.password.length <= 6) {
      return {
        errors: [{
          field: 'password',
          message: 'length must be greater than 6 chars'
        }]
      }
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);      
    } catch (error) {
      if (error.code === '23505' || error.details.includes('already exists')) {
        // duplicate username error
        return {
          errors: [{
            field: "username",
            message: "username has already been taken"
          }]
        }
      }
    }
      return { 
        user,
      };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserPasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username})
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'incorrect credentials'
        }]
      }
    }
    const checkPassword = await argon2.verify(user.password, options.password);
    if (!checkPassword) {
      return {
        errors: [{
          field: 'password',
          message: 'incorrect credentials'
        }]
      }
    }
    return {
      user,
    }
  }
}
