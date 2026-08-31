export type ProgrammeLevel = "Undergraduate" | "Postgraduate";

export interface DatabaseRow {
  [key: string]: unknown;
}

export interface Programme extends DatabaseRow {
  id: number;
  title: string;
  level: ProgrammeLevel;
  description: string;
  published: number;
  image_url: string;
}

export interface ModuleRow extends DatabaseRow {
  id: number;
  name: string;
  year: number;
  description: string;
  leader_name: string;
}

export interface StaffRow extends DatabaseRow {
  id: number;
  name: string;
  role_title: string;
  responsibility: string;
}

export interface User extends DatabaseRow {
  id: number;
  username: string;
  role: "admin" | "editor";
}

export interface SessionData {
  userId: number;
  username: string;
  role: "admin" | "editor";
  expiresAt: number;
}
