import { test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import AssetDetail from "./pages/AssetDetail";
import { mockAssetBackend, mockBackendDown } from "./test/mockBackend";

const assets = [
  {
    id: 1,
    name: "Dell Latitude 5440",
    type: "Laptop",
    serialNumber: "DL5440-8XK21",
    assignedTo: "Sara Alqahtani",
    status: "In Use",
    purchaseDate: "2024-02-11",
  },
  {
    id: 3,
    name: "HP EliteDesk 800",
    type: "Desktop",
    serialNumber: "HPED800-2MN7",
    assignedTo: "",
    status: "In Stock",
    purchaseDate: "2023-09-18",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderDetail(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/assets" element={<h1>Asset List Page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

test("Asset detail fetches and displays the asset by ID", async () => {
  const fetchMock = mockAssetBackend(assets);
  renderDetail("/assets/1");

  expect(screen.getByText("Loading asset...")).toBeInTheDocument();

  expect(
    await screen.findByRole("heading", { name: "Asset Details" })
  ).toBeInTheDocument();
  expect(screen.getByText("Dell Latitude 5440")).toBeInTheDocument();
  expect(screen.getByText("DL5440-8XK21")).toBeInTheDocument();
  expect(screen.getByText("Sara Alqahtani")).toBeInTheDocument();
  expect(screen.getByText("2024-02-11")).toBeInTheDocument();

  expect(fetchMock).toHaveBeenCalledWith(
    "http://localhost:8080/api/assets/1"
  );
});

test("Asset detail shows Unassigned when no employee", async () => {
  mockAssetBackend(assets);
  renderDetail("/assets/3");

  expect(await screen.findByText("Unassigned")).toBeInTheDocument();
});

test("Asset detail shows not found for a missing ID", async () => {
  mockAssetBackend(assets);
  renderDetail("/assets/99");

  expect(
    await screen.findByRole("heading", { name: "Asset Not Found" })
  ).toBeInTheDocument();
});

test("Asset detail shows not found for a non-numeric ID", async () => {
  mockAssetBackend(assets);
  renderDetail("/assets/abc");

  expect(
    await screen.findByRole("heading", { name: "Asset Not Found" })
  ).toBeInTheDocument();
});

test("Asset detail shows an error when the backend is down", async () => {
  mockBackendDown();
  renderDetail("/assets/1");

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Cannot connect to the Spring Boot server."
  );
});

test("Asset detail shows an error when the server returns 500", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    }))
  );
  renderDetail("/assets/1");

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Failed to load the asset."
  );
});

test("Back to Assets returns to the asset list", async () => {
  const user = userEvent.setup();
  mockAssetBackend(assets);
  renderDetail("/assets/1");

  await screen.findByText("Dell Latitude 5440");

  await user.click(screen.getByRole("link", { name: "Back to Assets" }));

  expect(
    screen.getByRole("heading", { name: "Asset List Page" })
  ).toBeInTheDocument();
});

test("Edit link points to the edit page", async () => {
  mockAssetBackend(assets);
  renderDetail("/assets/1");

  await screen.findByText("Dell Latitude 5440");

  expect(
    screen.getByRole("link", { name: "Edit Asset" })
  ).toHaveAttribute("href", "/edit/1");
});
