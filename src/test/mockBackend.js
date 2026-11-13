import { vi } from "vitest";

// A fake Spring Boot backend for React tests.
// It follows the same rules as AssetQueryService:
// search + status filter first, sort by id, then split into pages.
export function mockAssetBackend(assets) {
  const fetchMock = vi.fn(async (input) => {
    const url = new URL(String(input));
    const path = url.pathname;

    const json = (status, body) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });

    // GET /api/assets/{id}
    const detail = path.match(/^\/api\/assets\/(.+)$/);
    if (detail) {
      if (!/^\d+$/.test(detail[1])) {
        return json(400, { error: "Invalid ID." });
      }
      const id = Number(detail[1]);
      const asset = assets.find((a) => a.id === id);
      if (asset) {
        return json(200, asset);
      }
      // Like ResponseEntity.notFound().build(): 404 with an empty body
      return {
        ok: false,
        status: 404,
        json: async () => {
          throw new SyntaxError("Unexpected end of JSON input");
        },
      };
    }

    // GET /api/assets?page=&size=&search=&status=
    if (path === "/api/assets") {
      const page = Number(url.searchParams.get("page") ?? 0);
      const size = Number(url.searchParams.get("size") ?? 5);
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const status = url.searchParams.get("status");

      const matching = assets
        .filter(
          (a) =>
            !search ||
            [a.name, a.serialNumber, a.assignedTo].some((v) =>
              (v ?? "").toLowerCase().includes(search)
            )
        )
        .filter((a) => !status || a.status === status)
        .sort((a, b) => a.id - b.id);

      const totalPages = Math.ceil(matching.length / size);

      return json(200, {
        content: matching.slice(page * size, page * size + size),
        page,
        size,
        totalElements: matching.length,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
      });
    }

    return json(404, { error: "Not found" });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Simulates the backend not running
export function mockBackendDown() {
  const fetchMock = vi.fn(async () => {
    throw new TypeError("Failed to fetch");
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
