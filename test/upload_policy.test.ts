import assert from "node:assert/strict";
import test from "node:test";
import { decideUpload, uploadIntentSchema } from "../src/upload_policy.js";

test("signed documents receive the shorter delivery window and matter-scoped key", () => {
  const intent = uploadIntentSchema.parse({
    matterId: "MAT-A19F72",
    assetKind: "signed-document",
    fileName: "executed-retainer.pdf",
    contentType: "application/pdf",
    requestId: "c18d1cb8-14c7-4f7a-8645-5eca9e85e9de"
  });

  assert.deepEqual(decideUpload(intent), {
    key: "matters/MAT-A19F72/signed-document/c18d1cb8-14c7-4f7a-8645-5eca9e85e9de/executed-retainer.pdf",
    maxBytes: 10_000_000,
    expiresSeconds: 300
  });
});
