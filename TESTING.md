# Guia de Testes Unitários - Financas Mobile API

## Visão Geral

Este projeto possui uma suite completa de testes unitários que cobrem os principais componentes da aplicação, incluindo serviços, controladores, guards e filtros.

## Estrutura de Testes

Os testes estão organizados junto aos arquivos que testam, seguindo a convenção do NestJS:

```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   ├── auth.controller.ts
│   ├── auth.controller.spec.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── jwt.guard.spec.ts
│   └── strategies/
│       ├── jwt.strategy.ts
│       └── jwt.strategy.spec.ts
├── modules/
│   ├── contas/
│   │   ├── contas.service.ts
│   │   ├── contas.service.spec.ts
│   │   ├── contas.controller.ts
│   │   └── contas.controller.spec.ts
│   └── dashboard/
│       ├── dashboard.service.ts
│       ├── dashboard.service.spec.ts
│       ├── dashboard.controller.ts
│       └── dashboard.controller.spec.ts
└── common/
    ├── logger/
    │   ├── logger.service.ts
    │   └── logger.service.spec.ts
    └── filters/
        ├── http-exception.filter.ts
        └── http-exception.filter.spec.ts
```

## Executando os Testes

### Instalar Dependências de Teste

Antes de executar os testes, certifique-se de que as dependências de teste estão instaladas:

```bash
npm install --save-dev jest ts-jest @types/jest @nestjs/testing
```

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes em Modo Watch

Para desenvolvimento contínuo com reexecução ao salvar arquivos:

```bash
npm run test:watch
```

### Executar Testes com Cobertura

Para gerar relatório de cobertura de código:

```bash
npm run test:cov
```

Este comando gera um relatório na pasta `coverage/` com arquivos HTML que você pode abrir no navegador.

### Executar Testes de um Arquivo Específico

```bash
npm test -- auth.service.spec.ts
npm test -- contas.controller.spec.ts
```

### Executar Testes de um Módulo Específico

```bash
npm test -- auth/
npm test -- modules/contas/
```

## Estrutura dos Testes

### AuthService Tests (`auth.service.spec.ts`)

Testa as funcionalidades de autenticação:
- ✅ Login com email e senha válidos
- ✅ Rejeição de login com email não encontrado
- ✅ Rejeição de login com senha inválida
- ✅ Registro de novo usuário
- ✅ Validação de email duplicado
- ✅ Renovação de token JWT

### AuthController Tests (`auth.controller.spec.ts`)

Testa os endpoints de autenticação:
- ✅ POST `/auth/login`
- ✅ POST `/auth/register`
- ✅ POST `/auth/refresh`
- ✅ POST `/auth/logout`

### ContasService Tests (`contas.service.spec.ts`)

Testa operações CRUD de contas:
- ✅ Criar nova conta
- ✅ Listar contas com paginação
- ✅ Buscar conta por ID
- ✅ Atualizar conta
- ✅ Deletar (soft delete) conta
- ✅ Validação de conta não encontrada

### ContasController Tests (`contas.controller.spec.ts`)

Testa os endpoints de contas:
- ✅ POST `/api/contas` - Criar conta
- ✅ GET `/api/contas` - Listar contas
- ✅ GET `/api/contas/:id` - Obter conta
- ✅ PATCH `/api/contas/:id` - Atualizar conta
- ✅ DELETE `/api/contas/:id` - Deletar conta

### DashboardService Tests (`dashboard.service.spec.ts`)

Testa cálculos do dashboard:
- ✅ Retorno de indicadores completos (saldo, receitas, despesas)
- ✅ Cálculo correto de saldo total
- ✅ Agregação de despesas por categoria
- ✅ Tratamento de dados vazios

### DashboardController Tests (`dashboard.controller.spec.ts`)

Testa o endpoint do dashboard:
- ✅ GET `/api/dashboard` - Obter dados do dashboard

### JwtAuthGuard Tests (`jwt.guard.spec.ts`)

Testa o guard de autenticação JWT:
- ✅ Verificação de presença de token
- ✅ Validação de formato do token

### JwtStrategy Tests (`jwt.strategy.spec.ts`)

Testa a estratégia de validação JWT:
- ✅ Validação de payload JWT
- ✅ Retorno de dados do usuário

### LoggerService Tests (`logger.service.spec.ts`)

Testa o serviço de logging:
- ✅ Log de mensagens
- ✅ Log de erros
- ✅ Log de avisos

### HttpExceptionFilter Tests (`http-exception.filter.spec.ts`)

Testa o filtro de exceções:
- ✅ Tratamento de HttpException
- ✅ Formatação de respostas de erro

## Mockagem

Os testes usam mocks para simular dependências externas:

- **Supabase**: A função `createSupabaseClient()` é mockada
- **JWT**: O `JwtService` é mockado para retornar tokens de teste
- **Bcrypt**: As funções de hash são mockadas
- **UUID**: Gera UUIDs de teste previsíveis

## Exemplo de Teste

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return access token on successful login', async () => {
    const result = await service.login(loginDto);
    expect(result.access_token).toBeDefined();
  });
});
```

## Cobertura de Código

Atualmente, os testes cobrem:
- **Services**: Lógica de negócio principal
- **Controllers**: Validação de rotas e parâmetros
- **Guards**: Autenticação e autorização
- **Strategies**: Validação de JWT
- **Logger**: Funcionalidades de logging
- **Filters**: Tratamento de erros

Target de cobertura: 80% do código-fonte

## Próximos Passos

Para ampliar a cobertura de testes:

1. **Testes de Integração**: Criar testes end-to-end com banco de dados real
2. **Verificação de Tipos**: Adicionar testes de tipos TypeScript
3. **Testes de Performance**: Testar endpoints sob carga
4. **Testes de Segurança**: Validar proteção contra ataques comuns
5. **Mais Casos Edge**: Testar mais cenários de erro e validação

## Dicas para Desenvolvimento

### Executar teste enquanto desenvolve
```bash
npm run test:watch
```

### Ver cobertura visual
```bash
npm run test:cov
cd coverage
# Abrir index.html no navegador
```

### Debug de um teste
```bash
node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand
```

## Troubleshooting

### Erro: "Cannot find module '@/config/supabase.config'"

Certifique-se de que o alias `@/` está configurado em:
- `tsconfig.json`: `"path": { "@/*": ["src/*"] }`
- `jest.config.js`: `moduleNameMapper`

### Erro: "JwtService is not defined"

Adicione o `JwtService` ao módulo de teste com um mock:

```typescript
{
  provide: JwtService,
  useValue: mockJwtService,
}
```

### Testes falhando aleatoriamente

Certifique-se de limpar os mocks em `beforeEach()`:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Referências

- [Jest Documentation](https://jestjs.io)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Library](https://testing-library.com)

---

**Última atualização**: 23 de Fevereiro de 2026
