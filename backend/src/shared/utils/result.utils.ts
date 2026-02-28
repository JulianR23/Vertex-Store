export type Result<T, E = Error> =
  | { readonly isSuccess: true; readonly value: T }
  | { readonly isSuccess: false; readonly error: E };

/**
 * Creates a successful Result.
 */
export const ok = <T>(value: T): Result<T, never> => ({
  isSuccess: true,
  value,
});

/**
 * Creates a failed Result.
 */
export const fail = <E>(error: E): Result<never, E> => ({
  isSuccess: false,
  error,
});

/**
 * Maps over a successful Result value.
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> => {
  if (!result.isSuccess) return result;
  return ok(transform(result.value));
};

/**
 * Chains Result operations (flatMap / bind).
 */
export const chainResult = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, E>,
): Result<U, E> => {
  if (!result.isSuccess) return result;
  return transform(result.value);
};