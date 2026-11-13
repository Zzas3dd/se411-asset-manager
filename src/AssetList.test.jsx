import { test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AssetList from "./pages/AssetList";
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
    id: 2,
    name: "HP EliteDesk 800",
    type: "Desktop",
    serialNumber: "HPED800-2MN7",
    assignedTo: "",
    status: "In Stock",
    purchaseDate: "2023-09-18",
  },
];

// Seven assets, so there are two pages of five
const sevenAssets = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `Asset ${i + 1}`,
  type: "Laptop",
  serialNumber: `SN-${i + 1}`,
  assignedTo: "",
  status: i % 2 === 0 ? "In Use" : "In Stock",
  purchaseDate: "2024-01-01",
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderAssetList(deleteAsset = vi.fn()) {
  render(
    <MemoryRouter>
      <AssetList deleteAsset={deleteAsset} />
    </MemoryRouter>
  );
}

test("Asset list loads and displays assets from the backend", async () => {
  const fetchMock = mockAssetBackend(assets);
  renderAssetList();

  expect(screen.getByText("Loading assets...")).toBeInTheDocument();

  expect(
    await screen.findByText("Dell Latitude 5440")
  ).toBeInTheDocument();
  expect(screen.getByText("HP EliteDesk 800")).toBeInTheDocument();
  expect(screen.getByText("Total: 2")).toBeInTheDocument();

  expect(fetchMock).toHaveBeenCalledWith(
    "http://localhost:8080/api/assets?page=0&size=5"
  );
});

test("Asset list filters by status", async () => {
  const user = userEvent.setup();
  const fetchMock = mockAssetBackend(assets);
  renderAssetList();

  await screen.findByText("Dell Latitude 5440");

  await user.selectOptions(
    screen.getByLabelText("Filter by Status"),
    "In Stock"
  );

  expect(
    await screen.findByText("Total: 1")
  ).toBeInTheDocument();
  expect(screen.getByText("HP EliteDesk 800")).toBeInTheDocument();
  expect(
    screen.queryByText("Dell Latitude 5440")
  ).not.toBeInTheDocument();

  // The filter is sent to the backend, not applied to one page only
  expect(fetchMock).toHaveBeenLastCalledWith(
    "http://localhost:8080/api/assets?page=0&size=5&status=In+Stock"
  );
});

test("Asset list searches by asset name", async () => {
  const user = userEvent.setup();
  mockAssetBackend(assets);
  renderAssetList();

  await screen.findByText("HP EliteDesk 800");

  await user.type(screen.getByLabelText("Search"), "Dell");

  expect(await screen.findByText("Total: 1")).toBeInTheDocument();
  expect(screen.getByText("Dell Latitude 5440")).toBeInTheDocument();
  expect(
    screen.queryByText("HP EliteDesk 800")
  ).not.toBeInTheDocument();
});

test("Delete calls deleteAsset after confirmation", async () => {
  const user = userEvent.setup();
  const deleteAsset = vi.fn();
  mockAssetBackend(assets);
  vi.spyOn(window, "confirm").mockReturnValue(true);

  renderAssetList(deleteAsset);
  await screen.findByText("Dell Latitude 5440");

  const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
  await user.click(deleteButtons[0]);

  expect(window.confirm).toHaveBeenCalledWith(
    "Are you sure you want to delete this asset?"
  );
  expect(deleteAsset).toHaveBeenCalledWith(1);
  expect(deleteAsset).toHaveBeenCalledTimes(1);
});

test("Delete is cancelled when user rejects confirmation", async () => {
  const user = userEvent.setup();
  const deleteAsset = vi.fn();
  mockAssetBackend(assets);
  vi.spyOn(window, "confirm").mockReturnValue(false);

  renderAssetList(deleteAsset);
  await screen.findByText("Dell Latitude 5440");

  const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
  await user.click(deleteButtons[0]);

  expect(window.confirm).toHaveBeenCalled();
  expect(deleteAsset).not.toHaveBeenCalled();
});

test("Asset list displays message when no assets match", async () => {
  const user = userEvent.setup();
  mockAssetBackend(assets);
  renderAssetList();

  await screen.findByText("Dell Latitude 5440");

  await user.type(
    screen.getByLabelText("Search"),
    "Nonexistent Asset"
  );

  expect(
    await screen.findByText("No assets found.")
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Dell Latitude 5440")
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("HP EliteDesk 800")
  ).not.toBeInTheDocument();
});

test("Asset list provides links to asset details", async () => {
  mockAssetBackend(assets);
  renderAssetList();

  await screen.findByText("Dell Latitude 5440");

  const viewLinks = screen.getAllByRole("link", { name: "View" });

  expect(viewLinks).toHaveLength(2);
  expect(viewLinks[0]).toHaveAttribute("href", "/assets/1");
  expect(viewLinks[1]).toHaveAttribute("href", "/assets/2");
});

// ---------- Pagination ----------

test("Shows five assets per page and the current page", async () => {
  mockAssetBackend(sevenAssets);
  renderAssetList();

  expect(await screen.findByText("Asset 1")).toBeInTheDocument();
  expect(screen.getByText("Asset 5")).toBeInTheDocument();
  expect(screen.queryByText("Asset 6")).not.toBeInTheDocument();
  expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  expect(screen.getByText("Total: 7")).toBeInTheDocument();
});

test("Next and Previous move between pages", async () => {
  const user = userEvent.setup();
  mockAssetBackend(sevenAssets);
  renderAssetList();

  await screen.findByText("Asset 1");

  await user.click(screen.getByRole("button", { name: "Next" }));

  expect(await screen.findByText("Asset 6")).toBeInTheDocument();
  expect(screen.getByText("Asset 7")).toBeInTheDocument();
  expect(screen.queryByText("Asset 1")).not.toBeInTheDocument();
  expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Previous" }));

  expect(await screen.findByText("Asset 1")).toBeInTheDocument();
  expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
});

test("Buttons are disabled at the pagination boundaries", async () => {
  const user = userEvent.setup();
  mockAssetBackend(sevenAssets);
  renderAssetList();

  await screen.findByText("Asset 1");

  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("Asset 6");

  expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("Changing the filter returns to the first page", async () => {
  const user = userEvent.setup();
  mockAssetBackend(sevenAssets);
  renderAssetList();

  await screen.findByText("Asset 1");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("Asset 6");

  await user.selectOptions(
    screen.getByLabelText("Filter by Status"),
    "In Use"
  );

  // Assets 1, 3, 5, 7 are "In Use" and fit on one page
  expect(await screen.findByText("Total: 4")).toBeInTheDocument();
  expect(screen.getByText("Asset 1")).toBeInTheDocument();
  expect(screen.getByText("Asset 7")).toBeInTheDocument();
  expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("Search finds assets that are not on the current page", async () => {
  const user = userEvent.setup();
  mockAssetBackend(sevenAssets);
  renderAssetList();

  await screen.findByText("Asset 1");
  expect(screen.queryByText("Asset 7")).not.toBeInTheDocument();

  await user.type(screen.getByLabelText("Search"), "Asset 7");

  expect(await screen.findByText("Asset 7")).toBeInTheDocument();
  expect(screen.getByText("Total: 1")).toBeInTheDocument();
});

test("Empty backend shows no assets and disables both buttons", async () => {
  mockAssetBackend([]);
  renderAssetList();

  expect(
    await screen.findByText("No assets found.")
  ).toBeInTheDocument();
  expect(screen.getByText(/Page 0 of 0/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("Shows an error when the server returns 500 with no body", async () => {
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
  renderAssetList();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Failed to load assets."
  );
});

test("Shows an error when the backend is not running", async () => {
  mockBackendDown();
  renderAssetList();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Cannot connect to the Spring Boot server."
  );
  expect(screen.queryByText("No assets found.")).not.toBeInTheDocument();
});
