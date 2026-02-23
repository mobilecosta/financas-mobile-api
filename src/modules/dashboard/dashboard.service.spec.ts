import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';

jest.mock('@/config/supabase.config');

describe('DashboardService', () => {
  let service: DashboardService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    const { createSupabaseClient } = require('@/config/supabase.config');
    createSupabaseClient.mockReturnValue(mockSupabaseClient);
  });

  describe('getDashboard', () => {
    it('should return dashboard data with all indicators', async () => {
      const tenantId = 'tenant-123';

      const mockTenant = {
        id: tenantId,
        nome: 'Test Tenant',
      };

      const mockContas = [
        { saldo: 1000 },
        { saldo: 2000 },
        { saldo: 500 },
      ];

      const mockTransacoes = [
        { tipo: 'Receita', valor: 5000, categoria_id: 'cat-1', data_transacao: '2024-02-01' },
        { tipo: 'Receita', valor: 3000, categoria_id: 'cat-1', data_transacao: '2024-02-05' },
        { tipo: 'Despesa', valor: 1000, categoria_id: 'cat-2', data_transacao: '2024-02-10' },
        { tipo: 'Despesa', valor: 1500, categoria_id: 'cat-2', data_transacao: '2024-02-15' },
        { tipo: 'Despesa', valor: 500, categoria_id: 'cat-3', data_transacao: '2024-02-20' },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockTenant,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: mockContas,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({
                data: mockTransacoes,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: mockTransacoes.filter((t) => t.tipo === 'Despesa'),
                  error: null,
                }),
              }),
            }),
          }),
        });

      const result = await service.getDashboard(tenantId);

      expect(result.tenant).toEqual(mockTenant);
      expect(result.indicadores.saldoTotal).toBe(3500);
      expect(result.indicadores.receitas).toBe(8000);
      expect(result.indicadores.despesas).toBe(3000);
      expect(result.indicadores.saldo).toBe(5000);
      expect(result.transacoes).toBeDefined();
    });

    it('should return zero values when there are no transactions', async () => {
      const tenantId = 'tenant-123';

      const mockTenant = {
        id: tenantId,
        nome: 'Test Tenant',
      };

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockTenant,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        });

      const result = await service.getDashboard(tenantId);

      expect(result.indicadores.saldoTotal).toBe(0);
      expect(result.indicadores.receitas).toBe(0);
      expect(result.indicadores.despesas).toBe(0);
      expect(result.indicadores.saldo).toBe(0);
    });

    it('should calculate despesas por categoria correctly', async () => {
      const tenantId = 'tenant-123';

      const mockTenant = {
        id: tenantId,
        nome: 'Test Tenant',
      };

      const mockDespesas = [
        { categoria_id: 'cat-1', valor: 100 },
        { categoria_id: 'cat-1', valor: 200 },
        { categoria_id: 'cat-2', valor: 300 },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockTenant,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: mockDespesas,
                  error: null,
                }),
              }),
            }),
          }),
        });

      const result = await service.getDashboard(tenantId);

      expect(result.despesasPorCategoria['cat-1']).toBe(300);
      expect(result.despesasPorCategoria['cat-2']).toBe(300);
    });
  });
});
