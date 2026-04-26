/**
 * Express middleware factory for Zod validation.
 * Validates req.body against the provided schema.
 *
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Replace body with parsed (and coerced) values
  req.body = result.data;
  next();
};

export default validate;
