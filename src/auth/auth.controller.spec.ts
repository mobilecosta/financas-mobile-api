import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const loginDto: LoginDto = {
        tenant_id: 'tenant-123',
        email: 'user@example.com',
        senha: 'password123',
      };

      const expected = {
        access_token: 'jwt.token.here',
        usuario: {
          id: 'user-123',
          email: 'user@example.com',
          nome: 'Test User',
          perfil: 'usuario',
        },
      };

      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        tenant_id: 'tenant-123',
        email: 'newuser@example.com',
        senha: 'password123',
        nome: 'New User',
      };

      const expected = {
        access_token: 'jwt.token.here',
        usuario: {
          id: 'user-456',
          email: 'newuser@example.com',
          nome: 'New User',
          perfil: 'usuario',
        },
      };

      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      const req = {
        user: {
          sub: 'user-123',
          email: 'user@example.com',
          tenant_id: 'tenant-123',
          perfil: 'usuario',
        },
      };

      const expected = {
        access_token: 'new.jwt.token',
      };

      mockAuthService.refresh.mockResolvedValue(expected);

      const result = await controller.refresh(req);

      expect(result).toEqual(expected);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(req.user);
    });
  });

  describe('logout', () => {
    it('should return logout message', async () => {
      const result = await controller.logout();

      expect(result).toEqual({
        message: 'Logout realizado com sucesso',
      });
    });
  });
});
