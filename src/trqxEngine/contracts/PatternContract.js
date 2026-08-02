const REQUIRED_METADATA_FIELDS = ["id", "title", "category", "difficulty"];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validatePatternModule(pattern) {
  const errors = [];

  if (!isObject(pattern)) {
    return { valid: false, errors: ["Pattern module must be an object."] };
  }

  for (const field of REQUIRED_METADATA_FIELDS) {
    if (typeof pattern[field] !== "string" || pattern[field].trim() === "") {
      errors.push(`Pattern module requires a non-empty "${field}" field.`);
    }
  }

  if (typeof pattern.generate !== "function") {
    errors.push("Pattern module requires a generate function.");
  }

  return { valid: errors.length === 0, errors };
}

export function assertPatternModule(pattern) {
  const result = validatePatternModule(pattern);

  if (!result.valid) {
    throw new Error(`Invalid pattern module:\n${result.errors.join("\n")}`);
  }

  return pattern;
}

export default {
  validate: validatePatternModule,
  assert: assertPatternModule,
};
