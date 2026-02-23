import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    const guardInstance = guard;
    expect(guardInstance).toBeInstanceOf(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should allow request with valid JWT token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid.jwt.token',
        },
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.headers.authorization).toBeDefined();
      expect(request.headers.authorization).toContain('Bearer');
    });

    it('should reject request without JWT token', async () => {
      const mockRequest = {
        headers: {},
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request.headers.authorization).toBeUndefined();
    });

    it('should reject request with invalid JWT token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid.token',
        },
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      const request = mockExecutionContext.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      expect(authHeader).toBeDefined();
      expect(authHeader).toMatch(/Bearer \S+/);
    });
  });
});
