export function sanitize(data: any) {
  if (!data) return data;

  const clone = { ...data };

  if (clone.password) clone.password = '[REDACTED]';
  if (clone.accessToken) clone.accessToken = '[REDACTED]';
  if (clone.refreshToken) clone.refreshToken = '[REDACTED]';

  return JSON.stringify(clone);
}
