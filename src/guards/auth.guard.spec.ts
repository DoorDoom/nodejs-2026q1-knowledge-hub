import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGuard } from './auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard();
  });

  const createContext = (headers: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    }) as any;

  it('should throw if authorization header is missing', () => {
    const context = createContext({});

    expect(() => guard.canActivate(context)).toThrow(HttpException);

    try {
      guard.canActivate(context);
    } catch (e: any) {
      expect(e.message).toBe('Authorization header missing');
      expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should throw if token is invalid', () => {
    const context = createContext({
      authorization: 'Bearer bad-token',
    });

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid');
    });

    expect(() => guard.canActivate(context)).toThrow(HttpException);

    try {
      guard.canActivate(context);
    } catch (e: any) {
      expect(e.message).toBe('Invalid token');
      expect(e.getStatus()).toBe(HttpStatus.FORBIDDEN);
    }
  });

  it('should return true for valid token', () => {
    const context = createContext({
      authorization: 'Bearer good-token',
    });

    vi.spyOn(jwt, 'verify').mockReturnValue({ userId: 1 } as any);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith(
      'good-token',
      process.env.JWT_SECRET_KEY || 'secret',
    );
  });
});
