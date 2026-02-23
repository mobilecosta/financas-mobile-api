import { createClient } from '@supabase/supabase-js';

export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const createSupabaseClient = () => {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey);
};

export const createSupabaseAdminClient = () => {
  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
};
