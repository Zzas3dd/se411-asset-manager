
import { test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AssetList from "./pages/AssetList";


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


afterEach(() => {
  vi.restoreAllMocks();
});

function renderAssetList(deleteAsset = vi.fn()) {
  render(
    <MemoryRouter>
      <AssetList
        assets={assets}
        deleteAsset={deleteAsset}
      />
    </MemoryRouter>
  );
}

test("Asset list displays assets", () => {
  renderAssetList();

  expect(
    screen.getByText("Dell Latitude 5440")
  ).toBeInTheDocument();

  expect(
    screen.getByText("HP EliteDesk 800")
  ).toBeInTheDocument();
});

test("Asset list filters by status", async () => {
  const user = userEvent.setup();

  renderAssetList();

  await user.selectOptions(
    screen.getByLabelText("Filter by Status"),
    "In Stock"
  );

  expect(
    screen.getByText("HP EliteDesk 800")
  ).toBeInTheDocument();

  expect(
    screen.queryByText("Dell Latitude 5440")
  ).not.toBeInTheDocument();
});


test("Asset list searches by asset name", async () => {
  const user = userEvent.setup();

  renderAssetList();

  await user.type(
    screen.getByLabelText("Search"),
    "Dell"
  );

  expect(
    screen.getByText("Dell Latitude 5440")
  ).toBeInTheDocument();

  expect(
    screen.queryByText("HP EliteDesk 800")
  ).not.toBeInTheDocument();
});


test("Delete calls deleteAsset after confirmation", async () => {
  const user = userEvent.setup();
  const deleteAsset = vi.fn();

  vi.spyOn(window, "confirm").mockReturnValue(true);

  renderAssetList(deleteAsset);

  const deleteButtons = screen.getAllByRole(
    "button",
    { name: "Delete" }
  );

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

  vi.spyOn(window, "confirm").mockReturnValue(false);

  renderAssetList(deleteAsset);

  const deleteButtons = screen.getAllByRole(
    "button",
    { name: "Delete" }
  );

  await user.click(deleteButtons[0]);

  expect(window.confirm).toHaveBeenCalled();

  expect(deleteAsset).not.toHaveBeenCalled();
});

test("Asset list displays message when no assets match", async () => {
  const user = userEvent.setup();

  renderAssetList();

  await user.type(
    screen.getByLabelText("Search"),
    "Nonexistent Asset"
  );

  expect(
    screen.getByText("No assets found.")
  ).toBeInTheDocument();

  expect(
    screen.queryByText("Dell Latitude 5440")
  ).not.toBeInTheDocument();

  expect(
    screen.queryByText("HP EliteDesk 800")
  ).not.toBeInTheDocument();
});



test("Asset list provides links to asset details", () => {
  renderAssetList();

  const viewLinks = screen.getAllByRole(
    "link",
    { name: "View" }
  );

  expect(viewLinks).toHaveLength(2);

  expect(viewLinks[0]).toHaveAttribute(
    "href",
    "/assets/1"
  );

  expect(viewLinks[1]).toHaveAttribute(
    "href",
    "/assets/2"
  );
});
