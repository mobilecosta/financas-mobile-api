-- 002_metadata_tables.sql
-- Criação de tabelas de metadata global (sem tenant_id)

-- Tabela de Metadata de Menu
CREATE TABLE IF NOT EXISTS menu_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  rota VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  parent_id UUID,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES menu_metadata(id) ON DELETE CASCADE
);

-- Tabela de Metadata de Formulários
CREATE TABLE IF NOT EXISTS form_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade VARCHAR(100) NOT NULL UNIQUE,
  campos JSONB NOT NULL,
  validacoes JSONB,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_menu_metadata_parent ON menu_metadata(parent_id);
CREATE INDEX idx_menu_metadata_ativo ON menu_metadata(ativo);
CREATE INDEX idx_form_metadata_entidade ON form_metadata(entidade);
