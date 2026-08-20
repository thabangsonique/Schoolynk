import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecreteKey = process.env.SUPABASE_SECRETE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URLis missing");
}

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is missing");
}

if (!supabaseSecreteKey) {
  throw new Error("SUPABASE_SECRETE_KEY is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); // for general user request

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRETE_KEY,
);
