# Melhorando os Testes - Guia Avançado

## 📈 Aumentando a Cobertura de Testes

### 1. Testes de Validação de DTOs

Adicione testes para validar os Data Transfer Objects:

```typescript
// src/auth/dto/login.dto.spec.ts
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto Validation', () => {
  it('should fail when email is invalid', async () => {
    const dto = Object.assign(new LoginDto(), {
      tenant_id: 'tenant-123',
      email: 'invalid-email',
      senha: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass when all fields are valid', async () => {
    const dto = Object.assign(new LoginDto(), {
      tenant_id: 'tenant-123',
      email: 'user@example.com',
      senha: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
```

### 2. Testes de Middleware

Teste o middleware de CORS:

```typescript
// src/common/middleware/cors.middleware.spec.ts
import { CorsMiddleware } from './cors.middleware';

describe('CorsMiddleware', () => {
  let middleware: CorsMiddleware;
  const mockReq = {
    headers: {},
  };
  const mockRes = {
    setHeader: jest.fn(),
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    middleware = new CorsMiddleware();
  });

  it('should set CORS headers', () => {
    middleware.use(mockReq, mockRes, mockNext);
    
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
    expect(mockNext).toHaveBeenCalled();
  });
});
```

### 3. Testes de Serviços com Múltiplas Dependências

Para serviços mais complexos:

```typescript
describe('ContasService with Multiple Dependencies', () => {
  let service: ContasService;
  let supabaseService: SupabaseService;
  let cacheService: CacheService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContasService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<ContasService>(ContasService);
  });

  it('should cache conta after creation', async () => {
    const conta = await service.create(tenantId, createDto);
    
    expect(mockCacheService.set).toHaveBeenCalled();
  });

  it('should send notification after conta update', async () => {
    await service.update(tenantId, contaId, updateDto);
    
    expect(mockNotificationService.notify).toHaveBeenCalled();
  });
});
```

### 4. Testes de Exceções e Tratamento de Erros

Teste cenários de erro mais detalhadamente:

```typescript
describe('Error Handling', () => {
  it('should throw specific error when database is down', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockRejectedValue(
        new Error('Connection refused')
      ),
    });

    await expect(service.findAll(tenantId, paginationDto))
      .rejects
      .toThrow('Connection refused');
  });

  it('should handle transaction rollback', async () => {
    mockSupabase.rpc.mockResolvedValue({
      error: { code: 'ROLLBACK' },
    });

    await expect(service.create(tenantId, dto))
      .rejects
      .toThrow();
  });
});
```

### 5. Testes Parametrizados

Teste múltiplos cenários com menos código:

```typescript
describe.each([
  ['tenant-1', 'user1@example.com', 'pass123', true],
  ['tenant-2', 'user2@example.com', 'pass456', true],
  ['tenant-3', 'invalid@email', 'pass789', false],
])('Login variations', (tenant, email, password, shouldSucceed) => {
  it(`should ${shouldSucceed ? 'succeed' : 'fail'} for ${email}`, async () => {
    // test implementation
  });
});
```

## 🔄 Testes de Integração Aprimorados

### 1. Testes com Database Real

```typescript
// Usar TypeORM TestingModule com banco de teste
import { TypeOrmModule } from '@nestjs/typeorm';

beforeEach(async () => {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'financas_test',
        entities: [Conta, Transacao],
        synchronize: true,
      }),
    ],
  }).compile();
});
```

### 2. Testes de Performance

```typescript
describe('Performance Tests', () => {
  it('should list 1000 contas in less than 500ms', async () => {
    const start = Date.now();
    await service.findAll(tenantId, { page: 1, pageSize: 1000 });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
});
```

### 3. Testes Concorrentes

```typescript
describe('Concurrent Operations', () => {
  it('should handle multiple requests simultaneously', async () => {
    const promises = Array(10).fill(null).map((_, i) =>
      service.create(tenantId, {
        nome: `Conta ${i}`,
        tipo: 'corrente',
      })
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
    expect(new Set(results.map(r => r.id)).size).toBe(10);
  });
});
```

## 🔐 Testes de Segurança

### 1. Teste de Rate Limiting

```typescript
describe('Rate Limiting', () => {
  it('should reject requests after limit', async () => {
    for (let i = 0; i < 100; i++) {
      if (i < 99) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(200);
      } else {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(429); // Too Many Requests
      }
    }
  });
});
```

### 2. Teste de SQL Injection

```typescript
describe('Security - SQL Injection', () => {
  it('should prevent SQL injection in search', async () => {
    const maliciousInput = "'; DROP TABLE contas; --";

    const response = await request(app.getHttpServer())
      .get(`/api/contas?search=${encodeURIComponent(maliciousInput)}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Verificar que funciona normalmente, sem executar comando SQL
    expect(response.body.items).toBeDefined();
  });
});
```

### 3. Teste de CORS

```typescript
describe('CORS Configuration', () => {
  it('should allow requests from allowed origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard')
      .set('Origin', 'https://allowed-domain.com')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.get('Access-Control-Allow-Origin'))
      .toBe('https://allowed-domain.com');
  });

  it('should reject requests from disallowed origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dashboard')
      .set('Origin', 'https://malicious-domain.com')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.get('Access-Control-Allow-Origin'))
      .toBeUndefined();
  });
});
```

## 📊 Configuração de Relatórios de Cobertura

### 1. Aumentar Limites de Cobertura

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### 2. Gerar Relatório HTML

```bash
npm run test:cov -- --coverage-reporters=html
# Abrir coverage/index.html
```

### 3. Integração com Codecov

```bash
npm install --save-dev codecov
# Add to CI/CD pipeline:
codecov -f coverage/coverage-final.json
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run test
      - run: npm run test:cov
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 📝 Checklist Final

### Antes de fazer commit:
- [ ] Todos os testes passam: `npm test`
- [ ] Cobertura está acima de 80%: `npm run test:cov`
- [ ] Sem console.log ou debugger deixados
- [ ] Sem testes skipped (`.skip`)
- [ ] Sem testes com timeout > 5s

### Antes de fazer deploy:
- [ ] Todos os testes passam em CI/CD
- [ ] Relatório de cobertura foi revisado
- [ ] Performance tests passaram
- [ ] Security tests passaram

## 🎓 Recursos Adicionais

- [Jest Matchers](https://jestjs.io/docs/expect)
- [NestJS Testing Examples](https://github.com/nestjs/nest/tree/master/sample)
- [Testing Best Practices](https://jestjs.io/docs/testing-frameworks)
- [Mock Library Comparisons](https://github.com/umdjs/umd)

## 📌 Dicas Úteis

### Debug de Teste
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
# Abrir chrome://inspect no navegador
```

### Executar um teste isolado
```typescript
it.only('should test this only', () => {
  // Este teste será o único a executar
});
```

### Pular um teste temporariamente
```typescript
it.skip('should skip this test', () => {
  // Este teste não será executado
});
```

### Aumentar timeout de um teste lento
```typescript
it('should complete slowly', async () => {
  // implementação
}, 10000); // 10 segunds timeout
```

---

**Última atualização**: 23 de Fevereiro de 2026
