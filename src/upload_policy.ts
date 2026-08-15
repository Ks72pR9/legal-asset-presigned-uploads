import { z } from "zod";

export const uploadIntentSchema = z.object({
  matterId: z.string().regex(/^MAT-[A-Z0-9]{6,20}$/),
  assetKind: z.enum(["intake-evidence", "signed-document", "deadline-follow-up"]),
  fileName: z.string().min(1).max(120).regex(/^[a-zA-Z0-9._-]+$/),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  requestId: z.string().uuid()
});

export type UploadIntent = z.infer<typeof uploadIntentSchema>;

const limits = {
  "intake-evidence": 25_000_000,
  "signed-document": 10_000_000,
  "deadline-follow-up": 5_000_000
} as const;

export type UploadDecision = {
  key: string;
  maxBytes: number;
  expiresSeconds: number;
};

export function decideUpload(intent: UploadIntent): UploadDecision {
  return {
    key: `matters/${intent.matterId}/${intent.assetKind}/${intent.requestId}/${intent.fileName}`,
    maxBytes: limits[intent.assetKind],
    expiresSeconds: intent.assetKind === "signed-document" ? 300 : 600
  };
}
