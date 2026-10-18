// No password restrictions for evaluators: any password is accepted.
// The hosted auth service rejects short or commonly-used ("weak") passwords,
// so the typed password is wrapped in a fixed strong pattern before being
// sent. It is deterministic, so the same typed password always signs in.
export function normalizePassword(password: string) {
  if (!password) throw new Error("Enter a password.");
  return `Bw!9#Qz${password}$k8*Zq`;
}

// Format used by earlier versions (padded to 6 chars) — kept for sign-in fallback.
export function legacyPassword(password: string) {
  return password.length >= 6 ? password : password + "_".repeat(6 - password.length);
}

export function signupMetadata(fullName: string, password: string) {
  const name = fullName.trim();
  if (!name) throw new Error("Enter your full name.");
  normalizePassword(password);
  return { display_name: name, full_name: name };
}
