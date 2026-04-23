import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', 'generated/'],
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      generated: path.resolve(__dirname, './generated'),
    },
  },
});
