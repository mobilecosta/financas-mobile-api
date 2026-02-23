# Dependências para Testes - Guia de Instalação

## 📦 Pacotes Necessários

Para que todos os testes unitários funcionem corretamente, você precisa instalar as seguintes dependências de desenvolvimento:

### Comando de Instalação Rápida

```bash
npm install --save-dev jest ts-jest @types/jest @nestjs/testing supertest @types/supertest
```

## 📋 Lista Completa de DevDependencies

Adicione o seguinte ao seu `package.json` na seção `devDependencies`:

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.1.14",
    "@types/jest": "^29.5.8",
    "@types/node": "^25.3.0",
    "@types/supertest": "^2.0.12",
    "@types/uuid": "^10.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.4",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.9.3"
  }
}
```

## 📝 Versões Recomendadas

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| jest | ^29.7.0 | Framework de testes |
| ts-jest | ^29.1.1 | Transform TypeScript para Jest |
| @types/jest | ^29.5.8 | Tipos TypeScript para Jest |
| @nestjs/testing | ^11.1.14 | Utilities de teste do NestJS |
| supertest | ^6.3.3 | Library para testar HTTP |
| @types/supertest | ^2.0.12 | Tipos para supertest |

## 🔧 Arquivos de Configuração Necessários

### 1. `jest.config.js` ✅ (Já Criado)

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: [
    '<rootDir>',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### 2. `tsconfig.json` ✅ (Já Existe)

Certifique-se de que contém as configurações corretas:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 🚀 Instalação Passo a Passo

### 1. Instalar Dependências

```bash
cd d:\dev\git\mobilecosta\app\financas\financas-mobile-api
npm install --save-dev jest ts-jest @types/jest @nestjs/testing supertest @types/supertest
```

### 2. Verificar Instalação

```bash
npm list jest ts-jest @types/jest @nestjs/testing
```

Você deve ver algo como:
```
├── @nestjs/testing@11.1.14
├── @types/jest@29.5.8
├── jest@29.7.0
├── supertest@6.3.3
└── ts-jest@29.1.1
```

### 3. Verificar Scripts em package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

Os scripts já estão configurados no seu `package.json`. Se não estiverem, adicione-os manualmente.

## 🧪 Teste a Instalação

```bash
# Executar um teste específico
npm test auth.service.spec.ts

# Executar todos os testes
npm test

# Executar com cobertura
npm run test:cov
```

## ⚙️ Configuração Avançada (Opcional)

### Adicionar Suporte a Vários Reporters

```javascript
// jest.config.js
module.exports = {
  // ... configurações anteriores
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'results.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathAsClassName: 'true',
      },
    ],
  ],
};
```

Para isso, instale também:
```bash
npm install --save-dev jest-junit
```

### Adicionar Coverage Reports

```javascript
// jest.config.js
module.exports = {
  // ... configurações anteriores
  collectCoverage: true,
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## 🔍 Troubleshooting

### Erro: "Cannot find module 'jest'"

**Solução:** Instale o Jest:
```bash
npm install --save-dev jest ts-jest
```

### Erro: "Cannot find preset 'ts-jest'"

**Solução:** Certifique-se de que ts-jest está instalado e jest.config.js está correto:
```bash
npm install --save-dev ts-jest
```

### Erro: "Module not found: '@nestjs/testing'"

**Solução:** Instale @nestjs/testing:
```bash
npm install --save-dev @nestjs/testing
```

### Testes rodando lentamente

**Solução:** Use Cache do Jest:
```bash
npm test -- --clearCache
npm test
```

### Erro ao encontrar alias '@/'

**Solução:** Verifique se jest.config.js tem:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

## 📦 Atualizar Dependências

Para manter as dependências atualizadas:

```bash
# Ver quais pacotes têm atualizações disponíveis
npm outdated

# Atualizar para versões menores/patches
npm update

# Atualizar para versões maiores (cuidado!)
npm install --save-dev jest@latest ts-jest@latest
```

## 🎯 Próximo Passo

Depois de instalar as dependências, execute:

```bash
npm test
```

Todos os ~46 testes devem passar! ✅

---

## 📊 Verificação de Integridade

Para verificar se tudo está configurado corretamente:

```bash
# 1. Verificar Jest
npx jest --version
# Saída esperada: jest 29.x.x

# 2. Verificar ts-jest
npm list ts-jest
# Deve estar na lista

# 3. Rodar testes
npm test

# 4. Gerar cobertura
npm run test:cov
# Deve criar pasta coverage/
```

Se todas essas verificações passarem, a configuração está completa! 🎉

---

**Atualizado em**: 23 de Fevereiro de 2026
