import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

const createContext = (headers: any = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
    getHandler: () => ({}),
  }) as any;

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(new Reflector());
  });

  it('should allow if no roles metadata', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(undefined),
    } as any;

    const guard = new RolesGuard(reflector);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw if no auth header', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(['ADMIN']),
    } as any;

    const guard = new RolesGuard(reflector);
    const context = createContext({});

    expect(() => guard.canActivate(context)).toThrow(HttpException);

    try {
      guard.canActivate(context);
    } catch (e: any) {
      expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should throw if token is invalid', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(['ADMIN']),
    } as any;

    const guard = new RolesGuard(reflector);

    const context = createContext({
      authorization: 'Bearer bad',
    });

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it('should return false if role does not match', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(['ADMIN']),
    } as any;

    const guard = new RolesGuard(reflector);

    const context = createContext({
      authorization: 'Bearer token',
    });

    vi.spyOn(jwt, 'verify').mockReturnValue({
      role: 'user',
    } as any);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return true if role matches', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(['ADMIN']),
    } as any;

    const guard = new RolesGuard(reflector);

    const context = createContext({
      authorization: 'Bearer token',
    });

    vi.spyOn(jwt, 'verify').mockReturnValue({
      role: 'admin',
    } as any);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
