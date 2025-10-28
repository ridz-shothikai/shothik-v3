import type { Response } from "./response.type";

export type TRole =
  | "super-admin"
  | "admin"
  | "editor"
  | "author"
  | "contributor"
  | "subscriber"
  | "user";

export type TStatus = "in-progress" | "blocked";

export type TUser = {
  _id: string;
  image?: string;
  name: string;
  email: string;
  password_changed_at?: Date;
  role: TRole;
  status: TStatus;
  is_verified?: boolean;
};

export type TUserResponse = Response<TUser>;
export type TUsersResponse = Response<TUser[]>;
