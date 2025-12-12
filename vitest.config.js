import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.{js,ts}'],
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/data/**/*.ts', // Static data files
        'src/cli.ts', // CLI typically tested manually
        'src/types.ts', // Type definitions only
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 70,
        statements: 50,
      },
    },
    testTimeout: 30000,
  },
})
