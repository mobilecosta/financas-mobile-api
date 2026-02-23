-- 003_rls_policies.sql
-- Habilitar Row Level Security (RLS) e criar policies multi-tenant

-- Habilitar RLS nas tabelas
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Policies para tenant (apenas leitura para usuários autenticados do tenant)
CREATE POLICY "Tenants são visíveis para usuários do tenant" ON tenant
  FOR SELECT
  USING (id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

-- Policies para tenant_usuarios (isolamento por tenant)
CREATE POLICY "Usuários veem apenas usuários do seu tenant" ON tenant_usuarios
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON tenant_usuarios
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user)
    AND email = current_user);

-- Policies para contas (isolamento por tenant)
CREATE POLICY "Contas são visíveis apenas para usuários do tenant" ON contas
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Contas podem ser criadas apenas por usuários do tenant" ON contas
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Contas podem ser atualizadas apenas por usuários do tenant" ON contas
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Contas podem ser deletadas apenas por usuários do tenant" ON contas
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

-- Policies para categorias (isolamento por tenant)
CREATE POLICY "Categorias são visíveis apenas para usuários do tenant" ON categorias
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Categorias podem ser criadas apenas por usuários do tenant" ON categorias
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Categorias podem ser atualizadas apenas por usuários do tenant" ON categorias
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Categorias podem ser deletadas apenas por usuários do tenant" ON categorias
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

-- Policies para transações (isolamento por tenant)
CREATE POLICY "Transações são visíveis apenas para usuários do tenant" ON transacoes
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Transações podem ser criadas apenas por usuários do tenant" ON transacoes
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Transações podem ser atualizadas apenas por usuários do tenant" ON transacoes
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));

CREATE POLICY "Transações podem ser deletadas apenas por usuários do tenant" ON transacoes
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));
