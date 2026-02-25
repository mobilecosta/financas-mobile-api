-- Insert default tenant
INSERT INTO tenant (id, nome, descricao, ativo) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Tenant Padrão', 'Tenant padrão para desenvolvimento', true)
ON CONFLICT DO NOTHING;
