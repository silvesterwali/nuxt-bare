export const passwordService = {
  async hash(password: string): Promise<string> {
    return await hashPassword(password);
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return await verifyPassword(hash, password);
  },
};
