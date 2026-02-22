// shared/types/auth.d.ts
// Custom type declarations for nuxt-auth-utils

declare module "#auth-utils" {
  interface User {
    /** Primary key from users table */
    id: number;
    /** Full name (stored in users.name) */
    name?: string;
    /** Email address */
    email: string;
    /** Hashed password (null for OAuth) */
    password?: string | null;
    /** Role: user | admin | moderator */
    role: "user" | "admin" | "moderator";
    /** Whether email is verified */
    emailVerified: boolean;
    /** Whether account is active */
    isActive?: boolean;
    /** Created timestamp */
    createdAt?: number;
    /** Updated timestamp */
    updatedAt?: number;
    // you can add additional custom fields here
  }

  interface UserSession {
    // session may include subset of user fields or extras
    user: User;
    expiresAt?: number;
  }

  interface SecureSessionData {
    // if you store extra secure session data
  }
}

export {};
