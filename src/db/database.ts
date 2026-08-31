import { DB } from "@sqlite";

const DB_PATH = "./student_hub.db";

export const db = new DB(DB_PATH);
