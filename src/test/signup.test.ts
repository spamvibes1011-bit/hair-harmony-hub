import { describe, expect, it } from "vitest";
import { signupMetadata } from "@/lib/signup";

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
  it("allows simple passwords without character complexity", () => {
    expect(signupMetadata("Evaluator", "aaaaaa").full_name).toBe("Evaluator");
  });
});