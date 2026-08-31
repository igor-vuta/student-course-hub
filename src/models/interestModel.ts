import { db } from "../db/database.ts";

export interface InterestInput {
  programmeId: number;
  studentName: string;
  email: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ProgrammeInterestRow {
  [key: string]: unknown;
  id: number;
  student_name: string;
  email: string;
  created_at: string;
}

export interface MailingListRow {
  [key: string]: unknown;
  programme_id: number;
  programme_title: string;
  student_name: string;
  email: string;
  created_at: string;
}

export function validateInterestInput(input: InterestInput): ValidationResult {
  if (!Number.isInteger(input.programmeId) || input.programmeId < 1) {
    return { valid: false, message: "Invalid programme selected." };
  }

  const name = input.studentName.trim();
  if (name.length < 2 || name.length > 80) {
    return { valid: false, message: "Name must be between 2 and 80 characters." };
  }

  const email = input.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 120) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  return { valid: true };
}

export function createInterest(input: InterestInput): { ok: boolean; message: string } {
  try {
    db.query(
      `INSERT INTO interests (programme_id, student_name, email, created_at)
       VALUES (?, ?, ?, ?)`,
      [input.programmeId, input.studentName.trim(), input.email.trim().toLowerCase(), new Date().toISOString()],
    );

    return { ok: true, message: "Interest registered. We will be in touch soon." };
  } catch {
    return {
      ok: false,
      message:
        "This email is already registered for the selected programme, or the request is invalid.",
    };
  }
}

export function listInterestsForProgramme(programmeId: number): ProgrammeInterestRow[] {
  return db.queryEntries<ProgrammeInterestRow>(
    `SELECT id, student_name, email, created_at
     FROM interests
     WHERE programme_id = ?
     ORDER BY created_at DESC`,
    [programmeId],
  );
}

export function listMailingListRows(programmeId?: number): MailingListRow[] {
  if (programmeId && Number.isInteger(programmeId) && programmeId > 0) {
    return db.queryEntries<MailingListRow>(
      `SELECT p.id AS programme_id, p.title AS programme_title, i.student_name, i.email, i.created_at
       FROM interests i
       INNER JOIN programmes p ON p.id = i.programme_id
       WHERE i.programme_id = ?
       ORDER BY p.title, i.created_at DESC`,
      [programmeId],
    );
  }

  return db.queryEntries<MailingListRow>(
    `SELECT p.id AS programme_id, p.title AS programme_title, i.student_name, i.email, i.created_at
     FROM interests i
     INNER JOIN programmes p ON p.id = i.programme_id
     ORDER BY p.title, i.created_at DESC`,
  );
}

export function validateWithdrawInput(input: { programmeId: number; email: string }): ValidationResult {
  if (!Number.isInteger(input.programmeId) || input.programmeId < 1) {
    return { valid: false, message: "Invalid programme selected." };
  }

  const email = input.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 120) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  return { valid: true };
}

export function withdrawInterest(input: { programmeId: number; email: string }): { ok: boolean; message: string } {
  const normalizedEmail = input.email.trim().toLowerCase();
  db.query(
    "DELETE FROM interests WHERE programme_id = ? AND email = ?",
    [input.programmeId, normalizedEmail],
  );

  const result = db.queryEntries<{ changed: number }>("SELECT changes() AS changed");
  const changed = result[0]?.changed ?? 0;
  if (changed > 0) {
    return { ok: true, message: "Your interest has been withdrawn successfully." };
  }

  return { ok: false, message: "No matching registration was found for that email and programme." };
}

export function deleteInterestById(interestId: number): boolean {
  db.query("DELETE FROM interests WHERE id = ?", [interestId]);
  const result = db.queryEntries<{ changed: number }>("SELECT changes() AS changed");
  return (result[0]?.changed ?? 0) > 0;
}
