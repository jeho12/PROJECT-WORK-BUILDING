import { randomBytes } from 'crypto';

export function generateJitsiRoom(supervisorId: string, studentId: string): string {
  const hash = randomBytes(8).toString('hex');
  return `SIWES-${supervisorId.slice(-4)}-${studentId.slice(-4)}-${hash}`;
}
