import { infrai } from "./infrai_storage.js";

const bucket = process.env.INFRAI_ASSET_BUCKET ?? "legal-matter-assets";
const created = await infrai.storage.bucket.create(bucket);
console.log(JSON.stringify({ ready: true, bucket: created.name ?? bucket }, null, 2));
