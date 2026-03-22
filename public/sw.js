const map = new Map();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});


self.addEventListener("message", (event) => {
  const { type, shareCode, chunk, fileName, fileSize, fileType } = event.data;

  if (type === "METADATA") {
    // Initialize a new stream for this shareCode
    let controller;
    const stream = new ReadableStream({
      start(c) {
        controller = c;
      },
    });
    map.set(shareCode, {
      stream,
      controller,
      fileName,
      fileSize,
      fileType,
    });
  } else if (type === "CHUNK") {
    const entry = map.get(shareCode);
    if (entry && entry.controller) {
      entry.controller.enqueue(new Uint8Array(chunk));
    }
  } else if (type === "EOF") {
    const entry = map.get(shareCode);
    if (entry && entry.controller) {
      entry.controller.close();
      // Don't delete yet, the fetch needs to pull from it
    }
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/download-stream") {
    const shareCode = url.searchParams.get("shareCode");
    const entry = map.get(shareCode);

    if (entry) {
      const headers = new Headers({
        "Content-Type": entry.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(entry.fileName)}"`,
        "Content-Length": entry.fileSize,
      });

      event.respondWith(new Response(entry.stream, { headers }));
      map.delete(shareCode);
    } else {
      event.respondWith(new Response("Download expired or not found", { status: 404 }));
    }
  }
});
