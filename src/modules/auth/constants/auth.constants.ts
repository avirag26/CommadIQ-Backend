export const JWT_STRATEGY = 'jwt';

export const AUTH_MESSAGES = {
  REGISTERED: 'Account created successfully',
  LOGGED_IN: 'Logged in successfully',
  LOGGED_OUT: 'Logged out successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  EMAIL_IN_USE: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
} as const;
