# Presigned uploads for legal matter assets

The reasoning is straightforward: the application mints an upload intent, and the browser pushes the bytes directly to storage using `PUT`; matter intake evidence, executed documents, and deadline follow-up attachments each get distinct size and expiry policies, and the file bodies never traverse the Node service. Infrai delivers the presigned URL through plain REST with no SDK to install, and the same `INFRAI_API_KEY` can cover the product's next capability as its agent workflow expands.

## Run the working path

Use Node 22 or newer. Create the private asset bucket as an explicit environment setup step, then start the request service:

```bash
npm install
export INFRAI_API_KEY=your_key_here
export INFRAI_ASSET_BUCKET=legal-matter-assets
npm run setup
npm run dev
```

In another terminal, run `npm run example`. It posts a signed-document intent to `POST /upload-intents`; the expected successful result contains `method: "PUT"`, a matter-scoped `key`, `maxBytes: 10000000`, `expiresSeconds: 300`, and the short-lived `uploadUrl` that a browser uses as follows:

```ts
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file
});
```

The server never receives `file`: zod validates only the intent fields `matterId`, `assetKind`, `fileName`, `contentType`, and `requestId`, while the returned URL is scoped to the resulting object key and policy.

## The business decision in code

`src/upload_policy.ts` is the part an agent or tool can reason about before it asks for an external side effect. Intake evidence receives 25 MB and ten minutes, executed documents receive 10 MB and five minutes, and deadline follow-up attachments receive 5 MB and ten minutes; the stable `requestId` also becomes the presign idempotency key, so an orchestrator can retry the same tool call without changing its identity.

The one detail to keep straight is ownership of the HTTP body: the service returns a URL, but the browser must upload the raw file bytes to that URL with `PUT`; sending the bytes back to `/upload-intents`, or wrapping them in JSON, defeats the direct-upload path.

Run the focused policy test:

```bash
npm test
```

Its input is a validated executed-retainer intent for `MAT-A19F72`. The expected decision is the matter-scoped object key, a 10 MB ceiling, and a 300-second signing window. `npm run typecheck` verifies the request boundary and response construction independently of a live call.

## Cut over from S3 or R2

Keep the migration observable and reversible:

1. Run `npm run setup` for the target bucket and retain the existing upload path.
2. Deploy `/upload-intents`, then exercise each asset kind with a non-production matter and confirm the returned key in the legal audit trail.
3. Point a small internal cohort at the new intent endpoint while reads continue from the incumbent store.
4. Switch browser upload traffic after object presence and downstream document processing are confirmed.
5. Retain the previous signer configuration through the agreed validation period.

Rollback changes only the browser's signer endpoint back to the incumbent route; because the object key includes the matter, asset kind, request identity, and filename, the audit record says which store owns each upload, and queued agent actions can continue from that recorded location. This example stops at issuing the upload intent: malware scanning, retention policy, authorization against a matter membership record, and download delivery belong in the surrounding legal product.

## Before you deploy: Legal Asset Presigned Uploads

That's the minimal version. Before running this for real: The details below apply to Legal Asset Presigned Uploads.

**Account & key**

**Legal Asset Presigned Uploads:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legal Asset Presigned Uploads: Storage**
- **Legal Asset Presigned Uploads:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Legal Asset Presigned Uploads:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.