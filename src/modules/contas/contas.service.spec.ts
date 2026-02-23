import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContasService } from './contas.service';
import { CreateContaDto } from './dto/create-conta.dto';
import { UpdateContaDto } from './dto/update-conta.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

jest.mock('@/config/supabase.config');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-test-123'),
}));

describe('ContasService', () => {
  let service: ContasService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContasService],
    }).compile();

    service = module.get<ContasService>(ContasService);

    const { createSupabaseClient } = require('@/config/supabase.config');
    createSupabaseClient.mockReturnValue(mockSupabaseClient);
  });

  describe('create', () => {
    it('should create a new conta', async () => {
      const tenantId = 'tenant-123';
      const createContaDto: CreateContaDto = {
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo: 1000,
      };

      const mockConta = {
        id: 'uuid-test-123',
        tenant_id: tenantId,
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo: 1000,
        criado_em: new Date(),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockConta,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.create(tenantId, createContaDto);

      expect(result).toEqual(mockConta);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contas');
    });

    it('should throw error when insert fails', async () => {
      const tenantId = 'tenant-123';
      const createContaDto: CreateContaDto = {
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo: 1000,
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(service.create(tenantId, createContaDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated contas', async () => {
      const tenantId = 'tenant-123';
      const paginationDto: PaginationDto = {
        page: 1,
        pageSize: 10,
      };

      const mockContas = [
        {
          id: 'conta-1',
          nome: 'Conta 1',
          tenant_id: tenantId,
          ativo: true,
        },
        {
          id: 'conta-2',
          nome: 'Conta 2',
          tenant_id: tenantId,
          ativo: true,
        },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                count: 2,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  range: jest.fn().mockResolvedValue({
                    data: mockContas,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

      const result = await service.findAll(tenantId, paginationDto);

      expect(result.items).toEqual(mockContas);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalRecords).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      const tenantId = 'tenant-123';
      const paginationDto: PaginationDto = {
        page: 2,
        pageSize: 5,
      };

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                count: 15,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  range: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

      const result = await service.findAll(tenantId, paginationDto);

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a conta by id', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'conta-1';

      const mockConta = {
        id: contaId,
        nome: 'Conta 1',
        tenant_id: tenantId,
        ativo: true,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockConta,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.findOne(tenantId, contaId);

      expect(result).toEqual(mockConta);
    });

    it('should throw NotFoundException when conta not found', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'nonexistent';

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(service.findOne(tenantId, contaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a conta', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'conta-1';
      const updateContaDto: UpdateContaDto = {
        nome: 'Conta Atualizada',
      };

      const mockUpdatedConta = {
        id: contaId,
        nome: 'Conta Atualizada',
        tenant_id: tenantId,
        ativo: true,
      };

      // Mock findOne
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: contaId },
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUpdatedConta,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

      const result = await service.update(tenantId, contaId, updateContaDto);

      expect(result).toEqual(mockUpdatedConta);
    });

    it('should throw error when conta not found', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'nonexistent';
      const updateContaDto: UpdateContaDto = {
        nome: 'Conta Atualizada',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.update(tenantId, contaId, updateContaDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a conta', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'conta-1';

      // Mock findOne
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: contaId },
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }),
        });

      await service.remove(tenantId, contaId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contas');
    });

    it('should throw error when conta not found', async () => {
      const tenantId = 'tenant-123';
      const contaId = 'nonexistent';

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await expect(service.remove(tenantId, contaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
