// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

// Seeding admin
// const seeding = async () => {
//   const adminDate = {
//     name: "Zeiad Basem",
//     email: "zayadbassem9090@gmail.com",
//     phoneNumber: "+201055594811",
//     hashedPassword: bcrypt.hashSync("zyad9090_+||", 10),
//   };

//   await db.insert(adminsTable).values(adminDate);

//   console.log("Inserted....");
// };

// await seeding();

// seeding trainees
// const seeding = async () => {
//   const traineeData = {
//     name: "Basant Khaled",
//     email: "BasantKhaled@gmail.com",
//     phoneNumber: "+201055594811",
//     hashedPassword: bcrypt.hashSync("zyad9090_+||", 10),
//   };

//   await db.insert(traineesTable).values(traineeData);

//   console.log("Inserted....");
// };

// seeding();
