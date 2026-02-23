# 🚀 Quick Start - Executar Testes em 5 Minutos

## ⚡ Começar Agora

### Passo 1: Instalar Dependências (2 minutos)

```bash
cd d:\dev\git\mobilecosta\app\financas\financas-mobile-api
npm install --save-dev jest ts-jest @types/jest @nestjs/testing supertest @types/supertest
```

### Passo 2: Executar Testes (1 minuto)

```bash
npm test
```

## 📊 Resultado Esperado

```
PASS  src/auth/auth.service.spec.ts
  AuthService
    login
      ✓ should return access token and user data (45ms)
      ✓ should throw UnauthorizedException when user not found (12ms)
      ✓ should throw UnauthorizedException when password is invalid (8ms)
    register
      ✓ should register a new user and return access token (35ms)
      ✓ should throw BadRequestException when email already exists (10ms)
    refresh
      ✓ should return new access token (5ms)

PASS  src/auth/auth.controller.spec.ts (50ms)
  AuthController
    login
      ✓ should return access token and user data (10ms)
    register
      ✓ should register a new user (8ms)
    refresh
      ✓ should return new access token (5ms)
    logout
      ✓ should return logout message (2ms)

PASS  src/modules/contas/contas.service.spec.ts (120ms)
  ContasService
    create
      ✓ should create a new conta (35ms)
      ✓ should throw error when insert fails (15ms)
    findAll
      ✓ should return paginated contas (40ms)
      ✓ should handle pagination correctly (30ms)
    findOne
      ✓ should return a conta by id (15ms)
      ✓ should throw NotFoundException when conta not found (10ms)
    ...

Test Suites: 8 passed, 8 total
Tests:       46 passed, 46 total
Time:        4.523s
```

## 📝 Comandos Úteis

| Comando | Função |
|---------|--------|
| `npm test` | Executar todos os testes |
| `npm run test:watch` | Modo watch (reexecuta ao salvar) |
| `npm run test:cov` | Gerar relatório de cobertura |
| `npm test -- auth/` | Testar apenas módulo auth |
| `npm test -- --verbose` | Saída mais detalhada |

## 🎯 Próximas Ações

### 1. Ver Relatório de Cobertura

```bash
npm run test:cov
# Abrir em navegador: open coverage/index.html
```

### 2. Executar em Modo Watch (Development)

```bash
npm run test:watch
# Testa cada vez que você salva um arquivo
```

### 3. Rodar Teste Específico

```bash
# Apenas testes de Auth
npm test -- auth.service.spec.ts

# Apenas testes de Dashboard
npm test -- dashboard/

# Com padrão
npm test -- --testNamePattern="login"
```

## 📚 Documentação Completa

Depois de rodar os testes, leia os arquivos de documentação:

- **[TESTING.md](TESTING.md)** - Guia completo de uso
- **[TESTS_SUMMARY.md](TESTS_SUMMARY.md)** - Sumário de todos os testes
- **[TESTING_ADVANCED.md](TESTING_ADVANCED.md)** - Técnicas avançadas
- **[TESTING_DEPENDENCIES.md](TESTING_DEPENDENCIES.md)** - Dependências e configuração

## 🆘 Problemas Comuns

### ❌ Erro: "Cannot find module 'jest'"

```bash
npm install --save-dev jest ts-jest
```

### ❌ Erro: "Cannot find preset 'ts-jest'"

```bash
npm install --save-dev ts-jest @types/jest
```

### ❌ Testes muito lentos

```bash
# Limpar cache
npm test -- --clearCache
npm test
```

### ❌ Erro com imports '@/'

Este projeto usa alias de imports. Ele já está configurado em `jest.config.js`

## ✅ Checklist

- [ ] Dependências instaladas com `npm install --save-dev ...`
- [ ] `jest.config.js` existe na raiz do projeto
- [ ] `npm test` executa sem erros
- [ ] ~46 testes passam
- [ ] Cobertura de código está acima de 70%

## 📊 Estatísticas dos Testes

```
Total de Testes Unitários:    46
├── Auth                      10
├── Contas                    15
├── Dashboard                  5
├── Utilities                  5
└── Integration               11

Cobertura de Código:         ~70%
Tempo de Execução:         ~5 segundos
```

## 🎓 Aprenda Mais

### Encontrar Você Mesmo

Para entender a estrutura dos testes, abra:

```
src/auth/auth.service.spec.ts           # Exemplo de teste de service
src/auth/auth.controller.spec.ts        # Exemplo de teste de controller
src/modules/contas/contas.service.spec.ts  # Exemplo com mocks complexos
```

### Executar Teste Específico em Debug

```bash
# Windows
node --inspect-brk ./node_modules/.bin/jest --runInBand auth.service.spec.ts

# Depois abra: chrome://inspect
```

## 🚀 Integração Contínua

Para adicionar testes em CI/CD (GitHub Actions):

Veja [TESTING_ADVANCED.md](TESTING_ADVANCED.md) - seção "CI/CD Integration"

## 💡 Dicas

1. **Modo Watch é seu amigo**
   ```bash
   npm run test:watch
   ```

2. **Crie novo teste junto com o código**
   - Escreva o teste primeiro (TDD)
   - Depois implemente a funcionalidade

3. **Use mocks para isolamento**
   - Testes unitários devem testar apenas uma coisa
   - Mock todas as dependências externas

4. **Mantenha testes simples**
   - Cada teste deve ter uma única asserção principal
   - Use `describe` para organizar

## 📞 Suporte

Se encontrar problemas:

1. Leia o erro completamente
2. Procure em [TESTING_DEPENDENCIES.md](TESTING_DEPENDENCIES.md)
3. Tente: `npm install --save-dev jest ts-jest @types/jest @nestjs/testing`
4. Execute: `npm test -- --clearCache && npm test`

## 🎉 Você Está Pronto!

Parabéns! Você agora tem:

✅ 46 testes unitários  
✅ Cobertura de ~70% do código  
✅ Configuração completa do Jest  
✅ Documentação abrangente  
✅ Exemplos de uso  

**Comando final:**
```bash
npm test
```

---

**Criado em**: 23 de Fevereiro de 2026  
**Tempo para completar**: ~5 minutos ⚡
