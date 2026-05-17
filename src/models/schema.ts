import {
  uuid,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

const membershipEnum = pgEnum("membership_status", ["expired", "valid"]);

export const adminsTable = pgTable("admins", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const traineesTable = pgTable("trainees", {
  id: uuid().primaryKey().defaultRandom(),
  traineeId: integer("trainee_id")
    .generatedByDefaultAsIdentity({ startWith: 1001 })
    .unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  lastCheckIn: timestamp("last_check_in"),
  lastQr: uuid("last_qr"),
  membershipStatus: membershipEnum("membership_status").$default(
    () => "expired"
  ),
  membershipExpiryDate: timestamp("memebership_expiry_Date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
