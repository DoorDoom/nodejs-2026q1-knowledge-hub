import { genSaltSync, hashSync } from 'bcrypt';

export function generatePasswordHash(password: string): string {
  const saltRounds = process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS)
    : 10;
  const salt = genSaltSync(saltRounds);
  return hashSync(password, salt);
}
