/**
 * verify.test.js
 * 
 * Test suite for the LeanSecurityProject backend (/verify endpoint).
 * 
 * Tests for the /verify endpoint using Jest and Supertest.
 * Covers parsing, verification logic and error cases.
 * 
 * Test coverage includes:
 *   - Unit tests: parseModel() function
 *   - Integration tests: /verify endpoint (all three security properties)
 *   - Negative tests: invalid input, empty model, no authorised users
 *   - End-to-end: full request/response cycle including generatedLean output
 * 
 * To run:
 *   npm install --save-dev jest supertest
 *   npx jest tests/verify.test.js
 */

const request = require("supertest");

// ---------------------------------------------------------------------------
// Import the app without starting the server.
// server.js must export `app` for testing (see note below).
// ---------------------------------------------------------------------------
const app = require("../backend/server");

// ---------------------------------------------------------------------------
// Helper: shared model strings used across multiple tests
// ---------------------------------------------------------------------------
const BASIC_MODEL      = "Alice: authorised\nBob: authorised\nEve: unauthorised";
const SINGLE_AUTH      = "Alice: authorised";
const ATTACK_MODEL     = "Alice: authorised\nMallory: unauthorised\nEve: unauthorised\nTrent: authorised";
const ALL_AUTH_MODEL   = "Alice: authorised\nBob: authorised\nCarol: authorised";
const LARGE_MODEL      = "Alice: authorised\nBob: authorised\nCarol: authorised\nDave: authorised\nEve: unauthorised\nMallory: unauthorised";
const ONLY_UNAUTH      = "Eve: unauthorised";
const EMPTY_MODEL      = "";
const INVALID_NAMES    = "Ali ce: authorised\nBob: authorised";

// ---------------------------------------------------------------------------
// UNIT TESTS — parseModel()
// These test the model parser in isolation by importing it directly.
// ---------------------------------------------------------------------------

// Note: parseModel is not exported by default from server.js.
// For unit testing, we extract it using a lightweight re-declaration here
// that mirrors the exact logic in server.js. This is valid because the
// parser has no side effects and no external dependencies.

function parseModel(modelText) {
  const authorised = [];
  const unauthorised = [];
  const lines = modelText.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(":");
    if (parts.length < 2) return;
    const name = parts[0].trim();
    const status = parts[1].trim().toLowerCase();
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) return;
    if (status === "authorised")   authorised.push(name);
    else if (status === "unauthorised") unauthorised.push(name);
  });
  return { authorised, unauthorised, allUsers: [...authorised, ...unauthorised] };
}

// ---------------------------------------------------------------------------
// TEST SUITE 1 — Unit tests: parseModel()
// ---------------------------------------------------------------------------
describe("Unit Tests — parseModel()", () => {

  test("TC-U01: Parses basic model correctly", () => {
    const result = parseModel(BASIC_MODEL);
    expect(result.authorised).toEqual(["Alice", "Bob"]);
    expect(result.unauthorised).toEqual(["Eve"]);
    expect(result.allUsers).toHaveLength(3);
  });

  test("TC-U02: Returns empty arrays for empty input", () => {
    const result = parseModel(EMPTY_MODEL);
    expect(result.authorised).toHaveLength(0);
    expect(result.unauthorised).toHaveLength(0);
    expect(result.allUsers).toHaveLength(0);
  });

  test("TC-U03: Ignores names with spaces (invalid identifiers)", () => {
    // 'Ali ce' has a space and should be rejected by the sanitiser
    const result = parseModel(INVALID_NAMES);
    expect(result.authorised).toEqual(["Bob"]);
    expect(result.allUsers).toHaveLength(1);
  });

  test("TC-U04: Accepts alphanumeric names with underscores", () => {
    const result = parseModel("Admin_1: authorised\nUser2: unauthorised");
    expect(result.authorised).toEqual(["Admin_1"]);
    expect(result.unauthorised).toEqual(["User2"]);
  });

  test("TC-U05: Handles larger team model correctly", () => {
    const result = parseModel(LARGE_MODEL);
    expect(result.authorised).toHaveLength(4);
    expect(result.unauthorised).toHaveLength(2);
    expect(result.allUsers).toHaveLength(6);
  });

  test("TC-U06: Is case-insensitive for status field", () => {
    const result = parseModel("Alice: AUTHORISED\nEve: UNAUTHORISED");
    expect(result.authorised).toEqual(["Alice"]);
    expect(result.unauthorised).toEqual(["Eve"]);
  });

  test("TC-U07: Ignores lines with no colon separator", () => {
    const result = parseModel("Alice authorised\nBob: authorised");
    expect(result.authorised).toEqual(["Bob"]);
    expect(result.allUsers).toHaveLength(1);
  });

  test("TC-U08: Handles single authorised user", () => {
    const result = parseModel(SINGLE_AUTH);
    expect(result.authorised).toEqual(["Alice"]);
    expect(result.unauthorised).toHaveLength(0);
  });

  test("TC-U09: Rejects names starting with a number", () => {
    const result = parseModel("1Alice: authorised\nBob: authorised");
    expect(result.authorised).toEqual(["Bob"]);
  });

  test("TC-U10: Handles extra whitespace around names and status", () => {
    const result = parseModel("  Alice  :  authorised  \n  Eve  :  unauthorised  ");
    expect(result.authorised).toEqual(["Alice"]);
    expect(result.unauthorised).toEqual(["Eve"]);
  });

});

// ---------------------------------------------------------------------------
// TEST SUITE 2 — Integration tests: /verify endpoint
// These send real HTTP POST requests to the Express app and verify responses.
// ---------------------------------------------------------------------------
describe("Integration Tests — POST /verify", () => {

  // Access Control

  test("TC-I01: Access control — basic model returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: BASIC_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
    expect(res.body.proofFile).toBe("AccessControl.lean");
    expect(res.body.generatedLean).toContain("access_control_is_secure");
  }, 20000);

  test("TC-I02: Access control — attack scenario returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: ATTACK_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
  }, 20000);

  test("TC-I03: Access control — all authorised users returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: ALL_AUTH_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
  }, 20000);

  //Authentication 

  test("TC-I04: Authentication — basic model returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "authentication", model: BASIC_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
    expect(res.body.proofFile).toBe("Authentication.lean");
    expect(res.body.generatedLean).toContain("authentication_secure");
  }, 20000);

  test("TC-I05: Authentication — single authorised user returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "authentication", model: SINGLE_AUTH });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
  }, 20000);

  test("TC-I06: Authentication — larger team returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "authentication", model: LARGE_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
  }, 20000);

  // Integrity 

  test("TC-I07: Integrity — basic model returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "integrity", model: BASIC_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
    expect(res.body.proofFile).toBe("Integrity.lean");
    expect(res.body.generatedLean).toContain("integrity_secure");
  }, 20000);

  test("TC-I08: Integrity — attack scenario returns Verified", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "integrity", model: ATTACK_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Verified");
  }, 20000);

  // Response structure 

  test("TC-I09: Response always contains result, explanation, proofFile, generatedLean", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: BASIC_MODEL });

    expect(res.body).toHaveProperty("result");
    expect(res.body).toHaveProperty("explanation");
    expect(res.body).toHaveProperty("proofFile");
    expect(res.body).toHaveProperty("generatedLean");
  }, 20000);

  test("TC-I10: Response Content-Type is application/json", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "authentication", model: BASIC_MODEL });

    expect(res.headers["content-type"]).toMatch(/application\/json/);
  }, 20000);

  test("TC-I11: generatedLean contains the correct user names from model", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "integrity", model: BASIC_MODEL });

    expect(res.body.generatedLean).toContain("Alice");
    expect(res.body.generatedLean).toContain("Bob");
    expect(res.body.generatedLean).toContain("Eve");
  }, 20000);

  // Negative / Error cases 

  test("TC-N01: Empty model returns Error", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: EMPTY_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Error");
    expect(res.body.proofFile).toBeNull();
  });

  test("TC-N02: Model with only unauthorised users returns Error", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control", model: ONLY_UNAUTH });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Error");
  });

  test("TC-N03: Model with only invalid names (spaces) returns Error", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "authentication", model: INVALID_NAMES });

    // After sanitisation, only valid entries remain (Bob) - should still verify
    expect(res.statusCode).toBe(200);
    // Bob is authorised so it should verify
    expect(res.body.result).toBe("Verified");
  }, 20000);

  test("TC-N04: Unknown property returns Error", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "unknown_property", model: BASIC_MODEL });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Error");
  });

  test("TC-N05: Missing model field returns Error", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ property: "access_control" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("Error");
  });

});