import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltam REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY no .env.local");
}

// Cliente único do Supabase — a anon key é segura no front, protegida pelas políticas RLS.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
