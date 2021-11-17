import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2 chars",
      },
    ];
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include an @ sign",
      },
    ];
  }
  if (options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email format",
      },
    ];
  }
  if (options.password.length <= 6) {
    return [
      {
        field: "password",
        message: "length must be greater than 6 chars",
      },
    ];
  }

  return null;
};
