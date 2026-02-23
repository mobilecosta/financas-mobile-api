import { Test, TestingModule } from '@nestjs/testing';
import { ContasController } from './contas.controller';
import { ContasService } from './contas.service';
import { CreateContaDto } from './dto/create-conta.dto';
import { UpdateContaDto } from './dto/update-conta.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('ContasController', () => {
  let controller: ContasController;
  let service: ContasService;

  const mockContasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContasController],
      providers: [
        {
          provide: ContasService,
          useValue: mockContasService,
        },
      ],
    }).compile();

    controller = module.get<ContasController>(ContasController);
    service = module.get<ContasService>(ContasService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new conta', async () => {
      const createContaDto: CreateContaDto = {
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo: 1000,
      };

      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      const expected = {
        id: 'conta-1',
        nome: 'Conta Corrente',
        tipo: 'corrente',
        saldo: 1000,
      };

      mockContasService.create.mockResolvedValue(expected);

      const result = await controller.create(req, createContaDto);

      expect(result).toEqual(expected);
      expect(mockContasService.create).toHaveBeenCalledWith(
        'tenant-123',
        createContaDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated contas', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        pageSize: 10,
      };

      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      const expected = {
        items: [
          {
            id: 'conta-1',
            nome: 'Conta 1',
          },
        ],
        page: 1,
        pageSize: 10,
        totalRecords: 1,
        totalPages: 1,
      };

      mockContasService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(req, paginationDto);

      expect(result).toEqual(expected);
      expect(mockContasService.findAll).toHaveBeenCalledWith(
        'tenant-123',
        paginationDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a conta by id', async () => {
      const contaId = 'conta-1';
      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      const expected = {
        id: contaId,
        nome: 'Conta 1',
        tipo: 'corrente',
      };

      mockContasService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(req, contaId);

      expect(result).toEqual(expected);
      expect(mockContasService.findOne).toHaveBeenCalledWith(
        'tenant-123',
        contaId,
      );
    });
  });

  describe('update', () => {
    it('should update a conta', async () => {
      const contaId = 'conta-1';
      const updateContaDto: UpdateContaDto = {
        nome: 'Conta Atualizada',
      };

      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      const expected = {
        id: contaId,
        nome: 'Conta Atualizada',
        tipo: 'corrente',
      };

      mockContasService.update.mockResolvedValue(expected);

      const result = await controller.update(req, contaId, updateContaDto);

      expect(result).toEqual(expected);
      expect(mockContasService.update).toHaveBeenCalledWith(
        'tenant-123',
        contaId,
        updateContaDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a conta', async () => {
      const contaId = 'conta-1';
      const req = {
        user: {
          tenantId: 'tenant-123',
          sub: 'user-123',
        },
      };

      mockContasService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(req, contaId);

      expect(mockContasService.remove).toHaveBeenCalledWith(
        'tenant-123',
        contaId,
      );
    });
  });
});
