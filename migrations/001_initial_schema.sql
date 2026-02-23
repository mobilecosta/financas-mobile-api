-- 001_initial_schema.sql
-- Criação do schema inicial com tabelas multi-tenant

-- Tabela de Tenants
CREATE TABLE IF NOT EXISTS tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários por Tenant
CREATE TABLE IF NOT EXISTS tenant_usuarios (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, email)
);

-- Tabela de Contas
CREATE TABLE IF NOT EXISTS contas (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  saldo DECIMAL(15, 2) DEFAULT 0,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transacoes (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  conta_id UUID NOT NULL,
  categoria_id UUID NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_transacao DATE NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, conta_id) REFERENCES contas(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, categoria_id) REFERENCES categorias(tenant_id, id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_tenant_usuarios_email ON tenant_usuarios(tenant_id, email);
CREATE INDEX idx_contas_tenant ON contas(tenant_id);
CREATE INDEX idx_categorias_tenant ON categorias(tenant_id);
CREATE INDEX idx_transacoes_tenant ON transacoes(tenant_id);
CREATE INDEX idx_transacoes_conta ON transacoes(tenant_id, conta_id);
CREATE INDEX idx_transacoes_categoria ON transacoes(tenant_id, categoria_id);
CREATE INDEX idx_transacoes_data ON transacoes(tenant_id, data_transacao);
