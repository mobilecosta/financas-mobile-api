-- 007_update_menu_metadata.sql
-- Update seed de metadata do menu com parent_id

-- Limpar dados existentes do menu
DELETE FROM menu_metadata WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999'
);

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
  ('99999999-9999-9999-9999-999999999999', 'Segurança', 'po-icon-lock', '/seguranca', 2, true, '77777777-7777-7777-7777-777777777777');
