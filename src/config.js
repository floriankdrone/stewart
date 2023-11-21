import { z } from 'zod';

function config(logger) {
  const envSchema = z.object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('production'),
    DEBUG: z
      .string()
      .transform((value) =>
        ['true', 'yes', '1', 'on'].includes(value.toLowerCase()),
      )
      .default('false'),
    PORT: z.coerce.number().default(3000),
    DB_HOST: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z.coerce.number(),
    DB_DATABASE: z.string(),
  });

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    logger.error(
      `Missing or Invalid environment variable${
        parsed.error.errors.length > 1 ? 's' : ''
      }:
        ${parsed.error.errors
          .map((error) => ` ${error.path}: ${error.message}`)
          .join('\n')}`,
    );
    process.exit(1);
  }

  return Object.freeze(parsed.data);
}

export default config;
