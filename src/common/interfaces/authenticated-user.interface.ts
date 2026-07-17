export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export class AuthenticatedUser {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
}
