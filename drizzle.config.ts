import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit';

dotenv.config();

if(!process.env.DATABASE_URL){
    throw new Error("DATABASE_URL is not set in .env")
}

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations:{
    table: "_drizzle_migration",
    schema:"public",

  },
  verbose:true,
  strict:true,
});
