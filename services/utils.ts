
export const generateId = (): string => {
  // Check if crypto is available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if context is not secure
    }
  }
  // Fallback for older browsers or insecure contexts
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
