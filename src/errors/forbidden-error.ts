export function forbiddenError(message?: string) {
  return {
    name: 'ForbiddenError',
    message: message ?? 'Forbidden',
  };
}
