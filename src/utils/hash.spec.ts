import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePasswordHash } from './hash';
import { genSaltSync, hashSync } from 'bcrypt';

vi.mock('bcrypt', () => ({
  genSaltSync: vi.fn(),
  hashSync: vi.fn(),
}));

describe('generatePasswordHash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('should hash a password', () => {
    it('should hash password using default salt rounds', () => {
      delete process.env.SALT_ROUNDS;

      (genSaltSync as any).mockReturnValue('salt');
      (hashSync as any).mockReturnValue('hashed-password');

      const result = generatePasswordHash('password');

      expect(genSaltSync).toHaveBeenCalledWith(10);
      expect(hashSync).toHaveBeenCalledWith('password', 'salt');
      expect(result).toBe('hashed-password');
    });
  });

  it('should use env SALT_ROUNDS if provided', () => {
    process.env.SALT_ROUNDS = '12';

    (genSaltSync as any).mockReturnValue('salt');

    generatePasswordHash('password');

    expect(genSaltSync).toHaveBeenCalledWith(12);
  });

  it('should return value from hashSync', () => {
    (genSaltSync as any).mockReturnValue('salt');
    (hashSync as any).mockReturnValue('hashed');

    const result = generatePasswordHash('password');

    expect(result).toBe('hashed');
  });
});
