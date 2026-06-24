import {
  uuid,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership_status_enum", [
  "expired",
  "valid",
]);

export const staffEnum = pgEnum("staff_enum", ["owner", "receptionist"]);

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

export const gymsTable = pgTable("gyms", {
  id: uuid().primaryKey().defaultRandom(),
  gymName: varchar("gym_name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const staffTable = pgTable("staff", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  role: staffEnum("role").$default(() => "receptionist"),
  gymId: uuid("gym_id").references(() => gymsTable.id),
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
  gymId: uuid().references(() => gymsTable.id),
  membershipExpiryDate: timestamp("membership_expiry_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
