const input = {
  matterId: "MAT-A19F72",
  assetKind: "signed-document",
  fileName: "executed-retainer.pdf",
  contentType: "application/pdf",
  requestId: "c18d1cb8-14c7-4f7a-8645-5eca9e85e9de"
};

const response = await fetch("http://localhost:3000/upload-intents", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(input)
});
const result = await response.json();
console.log(JSON.stringify(result, null, 2));

export {};
