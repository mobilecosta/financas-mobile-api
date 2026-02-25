-- 004_seed_metadata.sql
-- Seed de metadata inicial

-- Menu Metadata (com parent_id para hierarquia)
INSERT INTO menu_metadata (id, label, icon, rota, ordem, ativo, parent_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dashboard', 'po-icon-home', '/dashboard', 1, true, NULL),
  ('22222222-2222-2222-2222-222222222222', 'Financeiro', 'po-icon-finance', NULL, 2, true, NULL),
  ('33333333-3333-3333-3333-333333333333', 'Contas', 'po-icon-bank-account', '/contas', 1, true, '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444444', 'Categorias', 'po-icon-tags', '/categorias', 2, true, '22222222-2222-2222-2222-222222222222'),
  ('55555555-5555-5555-5555-555555555555', 'Transações', 'po-icon-finance', '/transacoes', 3, true, '22222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666666', 'Relatórios', 'po-icon-chart-bar', '/relatorios', 3, true, '22222222-2222-2222-2222-222222222222'),
  ('77777777-7777-7777-7777-777777777777', 'Configurações', 'po-icon-settings', NULL, 4, true, NULL),
  ('88888888-8888-8888-8888-888888888888', 'Perfil', 'po-icon-user', '/perfil', 1, true, '77777777-7777-7777-7777-777777777777'),
  ('99999999-9999-9999-9999-999999999999', 'Segurança', 'po-icon-lock', '/seguranca', 2, true, '77777777-7777-7777-7777-777777777777')
ON CONFLICT (id) DO NOTHING;

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
