import * as dotenv from "dotenv";
dotenv.config();
import path from "path";
import { DataSource } from "typeorm";
import { Book } from "./entities/Book";
import {
  BookPosition,
  PersonalScore,
  ReadCheck,
} from "./entities/BookRelations";
import { Library } from "./entities/Library";
import { User, Stats } from "./entities/User";

export const db = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL!,
  // password: "LinkShake_db19*",
  logging: true,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [
    User,
    Stats,
    Library,
    Book,
    BookPosition,
    PersonalScore,
    ReadCheck,
  ],
});
