-- 000_setup_exec_sql.sql
-- Função para executar SQL arbitrário via RPC (Necessária para migrations)
-- Esta função deve ser criada manualmente no Editor SQL do Supabase caso o RPC falhe

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
