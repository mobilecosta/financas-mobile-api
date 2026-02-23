# Financas Mobile API - Documentação Técnica

## Visão Geral

Sistema SaaS Multi-Tenant para controle financeiro pessoal, construído com **NestJS**, **Supabase** e **PostgreSQL**.

## Arquitetura

### Stack Tecnológico

- **Runtime**: Node.js 20+
- **Framework**: NestJS 11+
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: JWT + Passport
- **Documentação**: Swagger OpenAPI 3
- **Deploy**: Vercel (Serverless)

### Estrutura de Diretórios

```
financas-mobile-api/
├── src/
│   ├── config/           # Configurações (Supabase, etc)
│   ├── auth/             # Módulo de autenticação
│   ├── modules/          # Módulos de negócio
│   │   ├── contas/       # CRUD de contas
│   │   ├── categorias/   # CRUD de categorias
│   │   ├── transacoes/   # CRUD de transações
│   │   └── dashboard/    # Dashboard com indicadores
│   ├── common/           # Utilitários compartilhados
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── filters/      # Filtros de exceção
│   │   ├── middleware/   # Middlewares
│   │   └── logger/       # Logger estruturado
│   ├── database/         # Serviços de banco de dados
│   ├── app.module.ts     # Módulo raiz
│   └── main.ts           # Ponto de entrada
├── migrations/           # SQL migrations versionadas
│   ├── 001_initial_schema.sql
│   ├── 002_metadata_tables.sql
│   ├── 003_rls_policies.sql
│   ├── 004_seed_metadata.sql
│   └── 005_schema_migrations_table.sql
├── scripts/              # Scripts utilitários
├── .env.example          # Variáveis de ambiente
├── tsconfig.json         # Configuração TypeScript
└── package.json          # Dependências
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=3600

# Environment
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Instalação

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar em desenvolvimento
npm run start:dev

# Executar migrations
npm run migration:dev
```

## Sistema de Migrations

### Conceito

O sistema de migrations garante que o banco de dados seja **versionado** e **reproduzível**. Toda alteração de schema ocorre via SQL versionado.

### Tabela de Controle

```sql
CREATE TABLE schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  executed_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'success'
);
```

### Migrations Disponíveis

| Versão | Descrição | Conteúdo |
|--------|-----------|----------|
| 001 | Schema Inicial | Tabelas: tenant, tenant_usuarios, contas, categorias, transacoes |
| 002 | Metadata Global | Tabelas: menu_metadata, form_metadata |
| 003 | RLS Policies | Políticas de isolamento multi-tenant |
| 004 | Seed Metadata | Dados iniciais de menu e formulários |
| 005 | Controle de Versões | Tabela schema_migrations |

### Executar Migrations

```bash
# Desenvolvimento
npm run migration:dev

# Produção
npm run migration
```

**Importante**: Migrations são executadas automaticamente ao iniciar a aplicação em produção. Use `SUPABASE_SERVICE_ROLE_KEY` para autenticação.

## Multi-Tenant

### Conceito

Cada tenant é uma empresa/organização isolada. Os dados são segregados por `tenant_id`.

### Tabelas Multi-Tenant

- `tenant` - Empresas
- `tenant_usuarios` - Usuários por empresa
- `contas` - Contas bancárias
- `categorias` - Categorias de transações
- `transacoes` - Transações financeiras

### Chave Primária Composta

```sql
PRIMARY KEY (tenant_id, id)
```

Garante isolamento de dados e performance.

### Row Level Security (RLS)

Policies automáticas garantem que usuários vejam apenas dados do seu tenant:

```sql
CREATE POLICY "Contas são visíveis apenas para usuários do tenant" ON contas
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_usuarios WHERE email = current_user));
```

## Autenticação

### Fluxo de Login

1. **POST** `/api/auth/login`
   ```json
   {
     "email": "user@example.com",
     "senha": "password123",
     "tenant_id": "uuid-tenant"
   }
   ```

2. Retorna JWT com payload:
   ```json
   {
     "sub": "user-id",
     "email": "user@example.com",
     "tenant_id": "tenant-id",
     "perfil": "usuario",
     "iat": 1234567890,
     "exp": 1234571490
   }
   ```

3. **Usar em requisições**:
   ```
   Authorization: Bearer <token>
   ```

### Endpoints de Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

## API Padrão PO UI

### Listagem com Paginação

**GET** `/api/contas?page=1&pageSize=10`

Resposta:
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 10,
  "totalRecords": 95,
  "totalPages": 10
}
```

### CRUD Padrão

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/contas` | Listar com paginação |
| GET | `/api/contas/:id` | Obter por ID |
| POST | `/api/contas` | Criar |
| PATCH | `/api/contas/:id` | Atualizar |
| DELETE | `/api/contas/:id` | Deletar (soft delete) |

## Dashboard

**GET** `/api/dashboard`

Retorna indicadores do tenant:

```json
{
  "tenant": {...},
  "indicadores": {
    "saldoTotal": 5000.00,
    "receitas": 3000.00,
    "despesas": 1500.00,
    "saldo": 1500.00
  },
  "despesasPorCategoria": {...},
  "transacoes": [...]
}
```

## Metadata Global

### Menu Metadata

Estrutura hierárquica de menus carregada dinamicamente pelo frontend:

```json
{
  "id": "uuid",
  "label": "Dashboard",
  "icon": "po-icon-home",
  "rota": "/dashboard",
  "ordem": 1,
  "parent_id": null
}
```

### Form Metadata

Define campos e validações de formulários:

```json
{
  "entidade": "contas",
  "campos": [
    {
      "name": "nome",
      "label": "Nome da Conta",
      "type": "text",
      "required": true,
      "maxLength": 255
    }
  ],
  "validacoes": {
    "nome": "required|maxLength:255"
  }
}
```

## Segurança

### Implementações

- **Helmet**: Headers HTTP de segurança
- **CORS**: Controle de origem
- **JWT**: Autenticação stateless
- **RLS**: Isolamento de dados no banco
- **Validação**: DTOs com class-validator
- **Rate Limiting**: Pode ser adicionado via middleware

### Boas Práticas

1. Nunca executar migrations via frontend
2. Usar `SUPABASE_SERVICE_ROLE_KEY` apenas no backend
3. Validar todos os inputs
4. Usar HTTPS em produção
5. Rotacionar JWT_SECRET regularmente

## Deploy - Vercel

### Estrutura Monorepo

```
root/
├── financas-mobile-api/
├── financas-mobile-web/
└── vercel.json
```

### Configuração Vercel

```json
{
  "version": 2,
  "builds": [
    {
      "src": "financas-mobile-api/package.json",
      "use": "@vercel/node"
    },
    {
      "src": "financas-mobile-web/package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "financas-mobile-api/src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "financas-mobile-web/dist/index.html"
    }
  ]
}
```

### Variáveis de Ambiente (Vercel)

Configurar no dashboard da Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Swagger/OpenAPI

Documentação interativa disponível em:

```
http://localhost:3000/api/docs
```

Documenta todos os endpoints, DTOs, autenticação e paginação.

## Logger Estruturado

Logs em formato JSON para melhor rastreamento:

```json
{
  "timestamp": "2024-02-23T10:30:00Z",
  "level": "LOG",
  "context": "ContasService",
  "message": "Conta criada com sucesso",
  "metadata": {"contaId": "uuid"}
}
```

## Troubleshooting

### Migrations não executam

1. Verificar `SUPABASE_SERVICE_ROLE_KEY`
2. Verificar conexão com Supabase
3. Verificar se tabela `schema_migrations` existe
4. Verificar logs: `npm run migration:dev`

### JWT inválido

1. Verificar `JWT_SECRET` no `.env`
2. Verificar expiração do token
3. Verificar formato: `Bearer <token>`

### CORS bloqueado

1. Verificar `CORS_ORIGIN` no `.env`
2. Verificar se frontend está na lista de origens permitidas

## Próximos Passos

1. Implementar Categorias e Transações (similar a Contas)
2. Adicionar Rate Limiting
3. Implementar Relatórios
4. Adicionar Testes Unitários
5. Configurar CI/CD
