/**
 * @fileoverview Request Validation Middleware Factory using Zod.
 * Validates req.body, req.query, or req.params against provided Zod schemas.
 */

/**
 * Creates an Express middleware that validates the specified request segment against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export default validate;
