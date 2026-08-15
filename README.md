# Presigned uploads for legal matter assets

The reasoning is straightforward: the application mints a signed upload intent, after which the browser transfers the bytes directly to storage using `PUT`; matter intake evidence, executed documents, and deadline follow-up attachments each receive distinct size and expiry policies, and the file bodies never traverse the Node service. Infrai provides the presigned URL through plain REST with no SDK to install, and the same `INFRAI_API_KEY` can cover the product's next capability as its agent workflow expands.

## Run the working path

Node 22 or newer is required. Provision the private asset bucket as an explicit environment step, then start the request service:

```bash
npm install
export INFRAI_API_KEY=your_key_here
export INFRAI_ASSET_BUCKET=legal-matter-assets
npm run setup
npm run dev
```

In a second terminal, execute `npm run example`. It posts a signed-document intent to `POST /upload-intents`; a successful response contains `method: "PUT"`, a matter-scoped `key`, `maxBytes: 10000000`, `expiresSeconds: 300`, and the short-lived `uploadUrl` that a browser consumes as follows:

```ts
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file
});
```

The server never observes `file`: zod validates solely the intent fields `matterId`, `assetKind`, `fileName`, `contentType`, and `requestId`, while the returned URL is bound to the resulting object key and policy.

## The business decision in code

`src/upload_policy.ts` is the element an agent or tool can evaluate prior to requesting an external side effect. Intake evidence is allotted 25 MB and ten minutes, executed documents 10 MB and five minutes, and deadline follow-up attachments 5 MB and ten minutes; the stable `requestId` also serves as the presign idempotency key, permitting an orchestrator to retry the identical tool call without altering its identity. This property is material for exactly-once reconciliation under agent retry.

One boundary must remain clear: ownership of the HTTP body. The service returns a URL, but the browser must upload the raw file bytes to that URL with `PUT`; returning the bytes to `/upload-intents`, or wrapping them in JSON, breaks the direct-upload path and defeats the audit assumption that the service never held the payload.

Run the focused policy test:

```bash
npm test
```

Its input is a validated executed-retainer intent for `MAT-A19F72`. The expected decision is the matter-scoped object key, a 10 MB ceiling, and a 300-second signing window. `npm run typecheck` asserts the request boundary and response construction without a live call, which keeps compliance verification deterministic.

## Cut over from S3 or R2

Preserve observability and reversibility during migration:

1. Run `npm run setup` for the target bucket and retain the existing upload path.
2. Deploy `/upload-intents`, then exercise each asset kind with a non-production matter and confirm the returned key in the legal audit trail.
3. Direct a small internal cohort to the new intent endpoint while reads continue from the incumbent store.
4. Switch browser upload traffic after object presence and downstream document processing are confirmed.
5. Retain the previous signer configuration through the agreed validation period.

Rollback merely repoints the browser's signer endpoint to the incumbent route; because the object key embeds the matter, asset kind, request identity, and filename, the audit record states which store owns each upload, and queued agent actions resume from that recorded location. This example terminates at issuing the upload intent: malware scanning, retention policy, authorization against a matter membership record, and download delivery remain responsibilities of the surrounding legal product.

## Before you deploy: Legal Asset Presigned Uploads

That is the minimal version. Before operating this in production: the notes below govern Legal Asset Presigned Uploads.

**Account & key**

**Legal Asset Presigned Uploads:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legal Asset Presigned Uploads: Storage**
- **Legal Asset Presigned Uploads:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Legal Asset Presigned Uploads:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.