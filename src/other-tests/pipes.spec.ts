import { describe, it, expect } from 'vitest';
import { ParseUUIDPipe, BadRequestException } from '@nestjs/common';

describe('ParseUUIDPipe', () => {
  const pipe = new ParseUUIDPipe({
    version: '4',
    exceptionFactory: () => new BadRequestException('Invalid UUID format'),
  });

  it('should return value for valid UUID', async () => {
    const valid = '550e8400-e29b-41d4-a716-446655440000';

    const result = await pipe.transform(valid, {} as any);

    expect(result).toBe(valid);
  });

  it('should throw for invalid UUID', async () => {
    await expect(pipe.transform('invalid', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });
});
