import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Role } from 'generated/prisma/enums';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { generatePasswordHash } from 'src/utils/hash';
import { CreateUserDto } from './dto/create-user.dto';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from './dto/update-password.dto';

const mockUsers = [
  {
    id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    login: 'admin',
    role: Role.ADMIN,
    password: generatePasswordHash('hashed-password'),
    createdAt: new Date(1776762848918),
    updatedAt: new Date(1776762848918),
    refreshToken: null,
  },
  {
    id: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    login: 'editor',
    role: Role.EDITOR,
    password: generatePasswordHash('hashed-password'),
    createdAt: new Date(1776762848923),
    updatedAt: new Date(1776762848923),
    refreshToken: null,
  },
  {
    id: 'f6b22e65-b5e3-49a1-be8a-60c40c54a5c4',
    login: 'asaa12',
    role: Role.VIEWER,
    password: generatePasswordHash('hashed-password'),
    createdAt: new Date(1776762924264),
    updatedAt: new Date(1776767948195),
    refreshToken: null,
  },
];

const resultUsers = [
  {
    id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    login: 'admin',
    role: 'admin',
    createdAt: 1776762848918,
    updatedAt: 1776762848918,
  },
  {
    id: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    login: 'editor',
    role: 'editor',
    createdAt: 1776762848923,
    updatedAt: 1776762848923,
  },
  {
    id: 'f6b22e65-b5e3-49a1-be8a-60c40c54a5c4',
    login: 'asaa12',
    role: 'viewer',
    createdAt: 1776762924264,
    updatedAt: 1776767948195,
  },
];

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);

    vi.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUsers[0]);
    vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUsers[0]);
    vi.spyOn(prisma.user, 'update').mockResolvedValue(mockUsers[0]);
    vi.spyOn(prisma.user, 'delete').mockResolvedValue(mockUsers[0]);

    usersService = new UsersService(prisma);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await usersService.findAll();

      expect(result).toEqual(resultUsers);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = await usersService.findOne({
        id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
      });

      expect(result).toEqual(resultUsers[0]);
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });
  });

  it('should throw NotFoundException', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      usersService.findOne({ id: '9e152776-2e6d-4f43-8328-19f2ebd6fa35' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return existing user if login exists', async () => {
    const result = await usersService.create({
      login: 'admin',
      password: '123',
    } as any);

    expect(result).toBeDefined();
    expect(result).toStrictEqual(resultUsers[0]);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should create new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    prisma.user.create.mockResolvedValue(mockUsers[0]);

    const result = await usersService.create({
      login: 'admin',
      password: '123',
    } as any);

    expect(prisma.user.create).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result).toStrictEqual(resultUsers[0]);
  });

  it('should update password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUsers[0]);
    prisma.user.update.mockResolvedValue(mockUsers[0]);

    const result = await usersService.update({
      where: { id: 1 },
      data: {
        oldPassword: 'hashed-password',
        newPassword: '456',
      },
    } as any);

    expect(prisma.user.update).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should prevent to put invalid password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUsers[0]);
    prisma.user.update.mockResolvedValue(mockUsers[0]);

    await expect(
      usersService.update({
        where: { id: 1 },
        data: {
          oldPassword: 'hashed-password123',
          newPassword: '456',
        },
      } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete user', async () => {
    const result = await usersService.delete({
      id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    });

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34' },
    });

    expect(result).toBeDefined();
  });

  it('should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      usersService.delete({ id: '9e152776-2e6d-4f43-8328-19f2ebd6fa36' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();
    dto.login = 'john';
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if login is empty', async () => {
    const dto = new CreateUserDto();
    dto.login = '';
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBe('Login cannot be empty');
  });

  it('should fail if password is missing', async () => {
    const dto = new CreateUserDto();
    dto.login = 'john';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass without optional role', async () => {
    const dto = new CreateUserDto();
    dto.login = 'john';
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid role', async () => {
    const dto = new CreateUserDto();
    dto.login = 'john';
    dto.password = '123';
    dto.role = 'INVALID' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdatePasswordDto', () => {
  it('should pass with valid data', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'old123';
    dto.newPassword = 'new123';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if oldPassword is empty', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = '';
    dto.newPassword = 'new123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'oldPassword')).toBeDefined();
  });

  it('should fail if newPassword is missing', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'old123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if types are invalid', async () => {
    const dto = new UpdatePasswordDto();
    (dto as any).oldPassword = 123;
    (dto as any).newPassword = true;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
