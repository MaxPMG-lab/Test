export interface User {
  username: string;
  password: string;
  description: string;
}

export const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
    description: 'Standard user with full access',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
    description: 'User locked out of the system',
  },
  problemUser: {
    username: 'problem_user',
    password: 'secret_sauce',
    description: 'User with known UI problems',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    description: 'User that triggers slow performance',
  },
  errorUser: {
    username: 'error_user',
    password: 'secret_sauce',
    description: 'User that triggers errors',
  },
  visualUser: {
    username: 'visual_user',
    password: 'secret_sauce',
    description: 'User with visual differences',
  },
} as const satisfies Record<string, User>;

export const VALID_USERS: User[] = [
  USERS.standard,
  USERS.problemUser,
  USERS.performanceGlitch,
  USERS.errorUser,
  USERS.visualUser,
];

export const INVALID_USERS: { username: string; password: string; expectedError: string }[] = [
  {
    username: '',
    password: '',
    expectedError: 'Epic sadface: Username is required',
  },
  {
    username: 'standard_user',
    password: '',
    expectedError: 'Epic sadface: Password is required',
  },
  {
    username: 'wrong_user',
    password: 'wrong_password',
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
];
