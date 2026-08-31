export function createModuleForProgramme(programmeId: number, input: { name: string; year: number; description: string }): void {
 
  db.query(
    `INSERT INTO modules (name, year, description) VALUES (?, ?, ?)`,
    [input.name, input.year, input.description],
  );
 
  const [{ lastInsertRowId }] = db.queryEntries<{ lastInsertRowId: number }>(
    `SELECT last_insert_rowid() as lastInsertRowId`
  );
 
  db.query(
    `INSERT INTO programme_modules (programme_id, module_id) VALUES (?, ?)`,
    [programmeId, lastInsertRowId],
  );
}
export function updateModule(id: number, input: { name: string; year: number; description: string }): void {
  db.query(
    `UPDATE modules SET name = ?, year = ?, description = ? WHERE id = ?`,
    [input.name, input.year, input.description, id],
  );
}
export function updateProgramme(id: number, input: {
  title: string;
  level: ProgrammeLevel;
  description: string;
  imageUrl: string;
  published: number;
}): void {
  db.query(
    `UPDATE programmes SET title = ?, level = ?, description = ?, image_url = ?, published = ? WHERE id = ?`,
    [input.title, input.level, input.description, input.imageUrl, input.published, id],
  );
}
import { db } from "../db/database.ts";
import type { ModuleRow, Programme, ProgrammeLevel, StaffRow } from "../types.ts";

type QueryRow<T> = T & Record<string, unknown>;

export interface ProgrammeFilters {
  search?: string;
  level?: ProgrammeLevel | "";
  includeUnpublished?: boolean;
}

export function listProgrammes(filters: ProgrammeFilters = {}): Programme[] {
  const params: Array<string | number> = [];
  const where: string[] = [];

  if (!filters.includeUnpublished) {
    where.push("published = 1");
  }

  if (filters.level) {
    where.push("level = ?");
    params.push(filters.level);
  }

  if (filters.search) {
    where.push("(title LIKE ? OR description LIKE ?)");
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  return db.queryEntries<QueryRow<Programme>>(
    `SELECT id, title, level, description, published, image_url
     FROM programmes
     ${whereClause}
     ORDER BY level, title`,
    params,
  );
}

export function getProgrammeById(id: number, includeUnpublished = false): Programme | undefined {
  const query = includeUnpublished
    ? "SELECT id, title, level, description, published, image_url FROM programmes WHERE id = ?"
    : "SELECT id, title, level, description, published, image_url FROM programmes WHERE id = ? AND published = 1";

  const results = db.queryEntries<QueryRow<Programme>>(query, [id]);
  return results[0];
}

export function listModulesForProgramme(programmeId: number): ModuleRow[] {
  return db.queryEntries<QueryRow<ModuleRow>>(
    `SELECT m.id, m.name, m.year, m.description, COALESCE(s.name, 'Unassigned') AS leader_name
     FROM modules m
     INNER JOIN programme_modules pm ON pm.module_id = m.id
     LEFT JOIN staff s ON s.id = m.leader_staff_id
     WHERE pm.programme_id = ?
     ORDER BY m.year, m.name`,
    [programmeId],
  );
}

export function listStaffForProgramme(programmeId: number): StaffRow[] {
  return db.queryEntries<QueryRow<StaffRow>>(
    `SELECT s.id, s.name, s.role_title, ps.responsibility
     FROM staff s
     INNER JOIN programme_staff ps ON ps.staff_id = s.id
     WHERE ps.programme_id = ?
     ORDER BY s.name`,
    [programmeId],
  );
}

export function createProgramme(input: {
  title: string;
  level: ProgrammeLevel;
  description: string;
  imageUrl: string;
  published: number;
}): void {
  db.query(
    `INSERT INTO programmes (title, level, description, image_url, published)
     VALUES (?, ?, ?, ?, ?)`,
    [input.title, input.level, input.description, input.imageUrl, input.published],
  );
}

export function setProgrammePublished(programmeId: number, published: number): void {
  db.query("UPDATE programmes SET published = ? WHERE id = ?", [published, programmeId]);
}

export function deleteProgrammeById(programmeId: number): boolean {
  const existing = db.queryEntries<{ id: number }>(
    "SELECT id FROM programmes WHERE id = ?",
    [programmeId],
  );
  if (existing.length === 0) {
    return false;
  }

  db.execute("BEGIN");
  try {

    const linkedModules = db.queryEntries<{ module_id: number }>(
      "SELECT module_id FROM programme_modules WHERE programme_id = ?",
      [programmeId],
    );

    db.query("DELETE FROM interests WHERE programme_id = ?", [programmeId]);
    db.query("DELETE FROM programme_staff WHERE programme_id = ?", [programmeId]);
    db.query("DELETE FROM programme_modules WHERE programme_id = ?", [programmeId]);

    for (const moduleRow of linkedModules) {
      const usage = db.queryEntries<{ total: number }>(
        "SELECT COUNT(*) as total FROM programme_modules WHERE module_id = ?",
        [moduleRow.module_id],
      );
      if ((usage[0]?.total ?? 0) === 0) {
        db.query("DELETE FROM modules WHERE id = ?", [moduleRow.module_id]);
      }
    }

    db.query("DELETE FROM programmes WHERE id = ?", [programmeId]);
    db.execute("COMMIT");
    return true;
  } catch {
    db.execute("ROLLBACK");
    throw new Error("Unable to delete programme.");
  }
}

export function deleteModuleById(programmeId: number, moduleId: number): boolean {

  const link = db.queryEntries<{ module_id: number }>(
    "SELECT module_id FROM programme_modules WHERE programme_id = ? AND module_id = ?",
    [programmeId, moduleId],
  );
  if (link.length === 0) {
    return false;
  }

  db.query(
    "DELETE FROM programme_modules WHERE programme_id = ? AND module_id = ?",
    [programmeId, moduleId],
  );


  const remaining = db.queryEntries<{ total: number }>(
    "SELECT COUNT(*) as total FROM programme_modules WHERE module_id = ?",
    [moduleId],
  );
  if ((remaining[0]?.total ?? 0) === 0) {
    db.query("DELETE FROM modules WHERE id = ?", [moduleId]);
  }

  return true;
}
