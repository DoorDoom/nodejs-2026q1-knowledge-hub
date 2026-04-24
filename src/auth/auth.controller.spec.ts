import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Role } from 'generated/prisma/enums';
import { generatePasswordHash } from 'src/utils/hash';
import { HttpException } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { a } from 'node_modules/vitest/dist/chunks/suite.d.udJtyAgw';

const mockUser = {
  id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
  login: 'admin',
  role: Role.ADMIN,
  password: generatePasswordHash('hashed-password'),
  createdAt: new Date(1776762848918),
  updatedAt: new Date(1776762848918),
  refreshToken: null,
};

const login = {
  login: 'admin',
  password: 'hashed-password',
};

const resultUser = {
  id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
  login: 'admin',
  role: 'admin',
  createdAt: 1776762848918,
  updatedAt: 1776762848918,
};

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNmIyMmU2NS1iNWUzLTQ5YTEtYmU4YS02MGM0MGM1NGE1YzQiLCJsb2dpbiI6ImFzYWExMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzcwMjc0NDYsImV4cCI6MTc3NzA0MTg0Nn0.yZX6yVCLidgbCJXS075KgCW2vRPkVy0-m69Fc34yQoE';
const refreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNmIyMmU2NS1iNWUzLTQ5YTEtYmU4YS02MGM0MGM1NGE1YzQiLCJsb2dpbiI6ImFzYWExMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzcwMjc0NDYsImV4cCI6MTc3NzExMzg0Nn0.46khguaE90l9beBECxKfBtGYVpNJbebBJtL4djMIQm4';

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

vi.mock('src/utils/hash', () => ({
  generatePasswordHash: vi.fn(),
}));

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
    vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
    vi.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

    vi.mocked(jwt.sign)
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    authService = new AuthService(prisma);
  });

  it('should generate tokens and save refreshToken', async () => {
    prisma.user.update.mockResolvedValue({});

    const result = await authService.updateTokens(mockUser);

    expect(jwt.sign).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });

  it('should create user', async () => {
    (generatePasswordHash as any).mockReturnValue('hashed');

    prisma.user.create.mockResolvedValue(mockUser);

    const result = await authService.create({
      login: 'admin',
      password: '123',
    } as any);

    expect(generatePasswordHash).toHaveBeenCalledWith('123');
    expect(prisma.user.create).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should throw error if user exists', async () => {
    vi.spyOn(prisma.user, 'create').mockRejectedValue({
      code: 'P2002',
    });

    await expect(authService.create(login)).rejects.toThrow(HttpException);
  });

  it('should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.login(login)).rejects.toThrow(HttpException);
  });

  it('should throw if password invalid', async () => {
    vi.mocked(hashSync).mockReturnValue('wrong');

    await expect(authService.login(login)).rejects.toThrow(HttpException);
  });

  it('should login and return tokens', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      login: 'test',
      role: 'ADMIN',
      password: 'hashed',
    });

    (hashSync as any).mockReturnValue('hashed');

    vi.spyOn(authService, 'updateTokens').mockResolvedValue({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const result = await authService.login({
      login: 'test',
      password: '123',
    } as any);

    expect(result).toEqual({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });

  it('should throw on invalid token', async () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });

    await expect(
      authService.refresh({ refreshToken: 'bad' } as any),
    ).rejects.toThrow(HttpException);
  });

  it('should refresh tokens', async () => {
    vi.spyOn(jwt, 'verify').mockReturnValue({ userId: 1 });

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      login: 'admin',
      role: 'ADMIN',
    });

    vi.spyOn(authService, 'updateTokens').mockResolvedValue({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const result = await authService.refresh({
      refreshToken: 'valid',
    } as any);

    expect(result).toEqual({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });
});
