import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasAnyPermission, hasPermission } from "./permissions";

describe("permissions", () => {
  it("requires all listed permissions", () => {
    assert.equal(
      hasPermission(["members:read", "members:manage"], [
        "members:read",
        "members:manage",
      ]),
      true,
    );

    assert.equal(hasPermission(["members:read"], ["members:manage"]), false);
  });

  it("supports any-of checks", () => {
    assert.equal(
      hasAnyPermission(["billing:read"], ["billing:manage", "billing:read"]),
      true,
    );
  });

  it("denies empty permission sets", () => {
    assert.equal(hasPermission(undefined, "org:read"), false);
    assert.equal(hasAnyPermission([], ["org:read"]), false);
  });
});
