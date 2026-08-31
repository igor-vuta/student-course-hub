import { db } from "../db/database.ts";
import type { User } from "../types.ts";
import * as bcrypt from "bcrypt";

export interface UserWithHash extends User {
  password_hash: string;
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const rows = db.queryEntries<UserWithHash>(
    "SELECT id, username, role, password_hash FROM users WHERE username = ?",
    [username],
  );

  const record = rows[0];
  if (!record) {
    return null;
  }

  const valid = await bcrypt.compare(password, record.password_hash);
  if (!valid) {
    return null;
  }

  return {
    id: record.id,
    username: record.username,
    role: record.role,
  };
}
