import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      const expected = {
        tenant: {
          id: 'tenant-123',
          nome: 'Test Tenant',
        },
        indicadores: {
          saldoTotal: 5000,
          receitas: 8000,
          despesas: 3000,
          saldo: 5000,
        },
        despesasPorCategoria: {
          'cat-1': 1000,
          'cat-2': 2000,
        },
        transacoes: [],
      };

      mockDashboardService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard(req);

      expect(result).toEqual(expected);
      expect(mockDashboardService.getDashboard).toHaveBeenCalledWith(
        'tenant-123',
      );
    });

    it('should handle empty dashboard data', async () => {
      const req = {
        user: {
          tenantId: 'tenant-456',
          sub: 'user-456',
        },
      };

      const expected = {
        tenant: null,
        indicadores: {
          saldoTotal: 0,
          receitas: 0,
          despesas: 0,
          saldo: 0,
        },
        despesasPorCategoria: {},
        transacoes: [],
      };

      mockDashboardService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard(req);

      expect(result).toEqual(expected);
    });
  });
});
