import { createServer, type ServerResponse } from "node:http";
import { ZodError } from "zod";
import { InfraiError, infrai } from "./infrai_storage.js";
import { decideUpload, uploadIntentSchema } from "./upload_policy.js";

const bucket = process.env.INFRAI_ASSET_BUCKET ?? "legal-matter-assets";
const port = Number(process.env.PORT ?? 3000);

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJson(request: AsyncIterable<Uint8Array>): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/upload-intents") {
    json(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const intent = uploadIntentSchema.parse(await readJson(request));
    const decision = decideUpload(intent);
    const signed = await infrai.storage.object.presign(bucket, decision.key, {
      op: "put",
      expires_seconds: decision.expiresSeconds,
      content_type: intent.contentType,
      max_bytes: decision.maxBytes,
      idempotency_key: intent.requestId
    });
    json(response, 201, {
      uploadUrl: signed.url,
      method: "PUT",
      key: decision.key,
      contentType: intent.contentType,
      maxBytes: decision.maxBytes,
      expiresSeconds: decision.expiresSeconds
    });
  } catch (error) {
    if (error instanceof ZodError) {
      json(response, 400, { error: "Invalid upload intent", issues: error.issues });
      return;
    }
    if (error instanceof InfraiError) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      json(response, status, { error: error.message, detail: error.detail });
      return;
    }
    json(response, 500, { error: error instanceof Error ? error.message : "Unexpected error" });
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => console.log(`Legal asset service listening on http://localhost:${port}`));
}
