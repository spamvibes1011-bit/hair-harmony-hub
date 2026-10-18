import { describe, expect, it } from "vitest";
import { normalizePassword, signupMetadata } from "@/lib/signup";

describe("Optional signup", () => {
  it("requires a nonblank full name", () => {
    expect(() => signupMetadata("   ", "simple")).toThrow("Enter your full name.");
  });
  it("saves the entered full name rather than Ananya", () => {
    expect(signupMetadata("  Vidushi Agarwal  ", "simple")).toEqual({
      display_name: "Vidushi Agarwal",
      full_name: "Vidushi Agarwal",
    });
  });
  it("accepts any password with no complexity rules", () => {
    expect(signupMetadata("Evaluator", "a").full_name).toBe("Evaluator");
    expect(normalizePassword("a")).toBe(normalizePassword("a"));
    expect(normalizePassword("123456").length).toBeGreaterThan(12);
  });
  it("rejects an empty password", () => {
    expect(() => normalizePassword("")).toThrow("Enter a password.");
  });
});
