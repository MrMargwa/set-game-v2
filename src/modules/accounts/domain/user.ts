export type UserId = string;

export type User = {
  id: UserId;
  username: string;
  email: string | null;
  createdAt: Date;
};

export type PublicUser = {
  id: UserId;
  username: string;
  email: string | null;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
