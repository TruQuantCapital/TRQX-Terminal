/*
Add these methods inside the object returned by createOperationsApi(getToken).
Use the same authenticated `request` helper used by your existing methods.
*/

async rewritePublishingContent(payload) {
  return request("/publishing/rewrite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
},

async getPublishingDestinations() {
  return request("/publishing/destinations");
},
