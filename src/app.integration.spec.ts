import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

/**
 * Arquivo de exemplo para testes de integração
 * Estes testes são mais complexos e testam múltiplos componentes juntos
 * 
 * Para usar este arquivo:
 * 1. Instale a dependência: npm install --save-dev supertest @types/supertest
 * 2. Configure um banco de dados de teste
 * 3. Execute: npm test -- app.integration.spec.ts
 */

describe('App Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('/auth/register (POST) - should register a new user', async () => {
      const registerDto = {
        tenant_id: 'test-tenant',
        email: 'newuser@example.com',
        senha: 'Password123!',
        nome: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.usuario).toHaveProperty('email');
      expect(response.body.usuario.email).toBe(registerDto.email);
    });

    it('/auth/login (POST) - should login an existing user', async () => {
      const loginDto = {
        tenant_id: 'test-tenant',
        email: 'newuser@example.com',
        senha: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.usuario).toHaveProperty('id');
    });

    it('/auth/login (POST) - should reject invalid credentials', async () => {
      const loginDto = {
        tenant_id: 'test-tenant',
        email: 'newuser@example.com',
        senha: 'WrongPassword',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('Contas API', () => {
    let authToken: string;
    let contaId: string;

    beforeAll(async () => {
      // Fazer login para obter token
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          tenant_id: 'test-tenant',
          email: 'newuser@example.com',
          senha: 'Password123!',
        });

      authToken = response.body.access_token;
    });

    it('/api/contas (POST) - should create a new conta', async () => {
      const createContaDto = {
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo_inicial: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/contas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createContaDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(createContaDto.nome);
      contaId = response.body.id;
    });

    it('/api/contas (GET) - should list contas with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contas?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('totalRecords');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('/api/contas/:id (GET) - should get a conta by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contas/${contaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(contaId);
    });

    it('/api/contas/:id (PATCH) - should update a conta', async () => {
      const updateContaDto = {
        nome: 'Conta Corrente Atualizada',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/contas/${contaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateContaDto)
        .expect(200);

      expect(response.body.nome).toBe(updateContaDto.nome);
    });

    it('/api/contas (GET) - should be protected by JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/contas')
        .expect(401);
    });

    it('/api/contas/:id (DELETE) - should delete a conta', async () => {
      await request(app.getHttpServer())
        .delete(`/api/contas/${contaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Tentar buscar a conta deletada
      await request(app.getHttpServer())
        .get(`/api/contas/${contaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Dashboard API', () => {
    let authToken: string;

    beforeAll(async () => {
      // Fazer login para obter token
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          tenant_id: 'test-tenant',
          email: 'newuser@example.com',
          senha: 'Password123!',
        });

      authToken = response.body.access_token;
    });

    it('/api/dashboard (GET) - should return dashboard data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tenant');
      expect(response.body).toHaveProperty('indicadores');
      expect(response.body.indicadores).toHaveProperty('saldoTotal');
      expect(response.body.indicadores).toHaveProperty('receitas');
      expect(response.body.indicadores).toHaveProperty('despesas');
    });

    it('/api/dashboard (GET) - should be protected by JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid request body', async () => {
      const invalidDto = {
        tenant_id: 'test-tenant',
        // email ausente - campo obrigatório
        senha: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent resource', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          tenant_id: 'test-tenant',
          email: 'newuser@example.com',
          senha: 'Password123!',
        });

      const authToken = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .get('/api/contas/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 for expired/invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/contas')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
