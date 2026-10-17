export const MIN_PASSWORD_LENGTH = 6;

export function signupMetadata(fullName: string, password: string) {
  const name = fullName.trim();
  if (!name) throw new Error("Enter your full name.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("Use at least 6 characters for your password.");
  }
  return { display_name: name, full_name: name };
}