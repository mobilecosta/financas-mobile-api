-- 004_seed_metadata.sql
-- Seed de metadata inicial

-- Menu Metadata
INSERT INTO menu_metadata (label, icon, rota, ordem, ativo) VALUES
  ('Dashboard', 'po-icon-home', '/dashboard', 1, true),
  ('Financeiro', 'po-icon-finance', NULL, 2, true),
  ('Contas', 'po-icon-ok', '/contas', 1, true),
  ('Categorias', 'po-icon-document', '/categorias', 2, true),
  ('Transações', 'po-icon-finance', '/transacoes', 3, true),
  ('Relatórios', 'po-icon-chart-bar', '/relatorios', 3, true),
  ('Configurações', 'po-icon-settings', NULL, 4, true),
  ('Perfil', 'po-icon-user', '/perfil', 1, true),
  ('Segurança', 'po-icon-lock', '/seguranca', 2, true)
ON CONFLICT DO NOTHING;

-- Form Metadata para Contas
INSERT INTO form_metadata (entidade, campos, validacoes) VALUES
  ('contas', 
   '[
     {"name": "nome", "label": "Nome da Conta", "type": "text", "required": true, "maxLength": 255},
     {"name": "tipo", "label": "Tipo de Conta", "type": "select", "required": true, "options": ["Corrente", "Poupança", "Investimento", "Cartão"]},
     {"name": "saldo", "label": "Saldo Inicial", "type": "number", "required": false, "min": 0},
     {"name": "descricao", "label": "Descrição", "type": "textarea", "required": false}
   ]',
   '{"nome": "required|maxLength:255", "tipo": "required"}')
ON CONFLICT DO NOTHING;

-- Form Metadata para Categorias
INSERT INTO form_metadata (entidade, campos, validacoes) VALUES
  ('categorias',
   '[
     {"name": "nome", "label": "Nome da Categoria", "type": "text", "required": true, "maxLength": 255},
     {"name": "tipo", "label": "Tipo", "type": "select", "required": true, "options": ["Receita", "Despesa"]},
     {"name": "descricao", "label": "Descrição", "type": "textarea", "required": false}
   ]',
   '{"nome": "required|maxLength:255", "tipo": "required"}')
ON CONFLICT DO NOTHING;

-- Form Metadata para Transações
INSERT INTO form_metadata (entidade, campos, validacoes) VALUES
  ('transacoes',
   '[
     {"name": "conta_id", "label": "Conta", "type": "select", "required": true},
     {"name": "categoria_id", "label": "Categoria", "type": "select", "required": true},
     {"name": "tipo", "label": "Tipo", "type": "select", "required": true, "options": ["Receita", "Despesa"]},
     {"name": "descricao", "label": "Descrição", "type": "text", "required": true, "maxLength": 255},
     {"name": "valor", "label": "Valor", "type": "number", "required": true, "min": 0},
     {"name": "data_transacao", "label": "Data", "type": "date", "required": true}
   ]',
   '{"conta_id": "required", "categoria_id": "required", "tipo": "required", "descricao": "required|maxLength:255", "valor": "required|min:0", "data_transacao": "required"}')
ON CONFLICT DO NOTHING;
