import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('@/config/supabase.config');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const loginDto: LoginDto = {
        tenant_id: 'tenant-123',
        email: 'user@example.com',
        senha: 'password123',
      };

      const mockUsuario = {
        id: 'user-123',
        email: 'user@example.com',
        nome: 'Test User',
        perfil: 'usuario',
        tenant_id: 'tenant-123',
        senha_hash: 'hashed_password',
      };

      const mockToken = 'jwt.token.here';

      const { createSupabaseClient } = require('@/config/supabase.config');
      createSupabaseClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUsuario,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        usuario: {
          id: 'user-123',
          email: 'user@example.com',
          nome: 'Test User',
          perfil: 'usuario',
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        tenant_id: 'tenant-123',
        email: 'nonexistent@example.com',
        senha: 'password123',
      };

      const { createSupabaseClient } = require('@/config/supabase.config');
      createSupabaseClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: 'Not found',
                }),
              }),
            }),
          }),
        }),
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        tenant_id: 'tenant-123',
        email: 'user@example.com',
        senha: 'wrongpassword',
      };

      const mockUsuario = {
        id: 'user-123',
        email: 'user@example.com',
        nome: 'Test User',
        perfil: 'usuario',
        tenant_id: 'tenant-123',
        senha_hash: 'hashed_password',
      };

      const { createSupabaseClient } = require('@/config/supabase.config');
      createSupabaseClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUsuario,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto: RegisterDto = {
        tenant_id: 'tenant-123',
        email: 'newuser@example.com',
        senha: 'password123',
        nome: 'New User',
      };

      const mockNovoUsuario = {
        id: 'user-456',
        email: 'newuser@example.com',
        nome: 'New User',
        perfil: 'usuario',
        tenant_id: 'tenant-123',
      };

      const mockToken = 'jwt.token.here';

      const { createSupabaseClient } = require('@/config/supabase.config');
      createSupabaseClient.mockReturnValue({
        from: jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          })
          .mockReturnValueOnce({
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockNovoUsuario,
                  error: null,
                }),
              }),
            }),
          }),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: mockToken,
        usuario: {
          id: 'user-456',
          email: 'newuser@example.com',
          nome: 'New User',
          perfil: 'usuario',
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.senha, 10);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const registerDto: RegisterDto = {
        tenant_id: 'tenant-123',
        email: 'existing@example.com',
        senha: 'password123',
        nome: 'Existing User',
      };

      const mockExistingUser = {
        id: 'user-123',
      };

      const { createSupabaseClient } = require('@/config/supabase.config');
      createSupabaseClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockExistingUser,
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      const payload = {
        sub: 'user-123',
        email: 'user@example.com',
        tenant_id: 'tenant-123',
        perfil: 'usuario',
      };

      const mockToken = 'new.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.refresh(payload);

      expect(result).toEqual({
        access_token: mockToken,
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
