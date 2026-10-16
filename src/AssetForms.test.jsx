
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import EditAsset from "./pages/EditAsset";

// ========================================
// ADD ASSET TESTS
// ========================================

test("Add Asset page displays the form", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole("link", { name: "Add Asset" })
  );

  expect(
    screen.getByRole("heading", { name: "Add Asset" })
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText("Asset Name")
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText("Serial Number")
  ).toBeInTheDocument();
});

test("Add Asset rejects empty required fields", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole("link", { name: "Add Asset" })
  );

  await user.click(
    screen.getByRole("button", { name: "Add Asset" })
  );

  expect(
    screen.getByRole("alert")
  ).toHaveTextContent(
    "Please fill in all required fields."
  );
});

test("Add Asset rejects duplicate serial numbers", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole("link", { name: "Add Asset" })
  );

  await user.type(
    screen.getByLabelText("Asset Name"),
    "Test Laptop"
  );

  await user.selectOptions(
    screen.getByLabelText("Asset Type"),
    "Laptop"
  );

  await user.type(
    screen.getByLabelText("Serial Number"),
    "DL5440-8XK21"
  );

  await user.selectOptions(
    screen.getByLabelText("Status"),
    "In Stock"
  );

  await user.type(
    screen.getByLabelText("Purchase Date"),
    "2026-01-10"
  );

  await user.click(
    screen.getByRole("button", { name: "Add Asset" })
  );

  expect(
    screen.getByRole("alert")
  ).toHaveTextContent(
    "This serial number already exists."
  );
});

test("Add Asset rejects future purchase dates", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole("link", { name: "Add Asset" })
  );

  await user.type(
    screen.getByLabelText("Asset Name"),
    "Future Laptop"
  );

  await user.selectOptions(
    screen.getByLabelText("Asset Type"),
    "Laptop"
  );

  await user.type(
    screen.getByLabelText("Serial Number"),
    "FUTURE-123"
  );

  await user.selectOptions(
    screen.getByLabelText("Status"),
    "In Stock"
  );

  await user.type(
    screen.getByLabelText("Purchase Date"),
    "2099-01-01"
  );

  await user.click(
    screen.getByRole("button", { name: "Add Asset" })
  );

  expect(
    screen.getByRole("alert")
  ).toHaveTextContent(
    "Purchase date cannot be in the future."
  );
});

test("Add Asset saves a valid asset", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole("link", { name: "Add Asset" })
  );

  await user.type(
    screen.getByLabelText("Asset Name"),
    "ASUS Zenbook"
  );

  await user.selectOptions(
    screen.getByLabelText("Asset Type"),
    "Laptop"
  );

  await user.type(
    screen.getByLabelText("Serial Number"),
    "ASUS-NEW-123"
  );

  await user.selectOptions(
    screen.getByLabelText("Status"),
    "In Stock"
  );

  await user.type(
    screen.getByLabelText("Purchase Date"),
    "2026-01-10"
  );

  await user.click(
    screen.getByRole("button", { name: "Add Asset" })
  );

  expect(
    screen.getByText("ASUS Zenbook")
  ).toBeInTheDocument();
});

// ========================================
// EDIT ASSET TEST DATA
// ========================================

const testAssets = [
  {
    id: 1,
    name: "Dell Latitude 5440",
    type: "Laptop",
    serialNumber: "DL5440-8XK21",
    assignedTo: "Sara",
    status: "In Use",
    purchaseDate: "2024-02-11",
  },
  {
    id: 2,
    name: "Lenovo ThinkPad",
    type: "Laptop",
    serialNumber: "LENOVO-123",
    assignedTo: "",
    status: "In Stock",
    purchaseDate: "2024-05-03",
  },
];

// Helper function to open the Edit Asset page
function renderEditForm(updateAsset = vi.fn()) {
  render(
    <MemoryRouter initialEntries={["/edit/1"]}>
      <Routes>
        <Route
          path="/edit/:id"
          element={
            <EditAsset
              assets={testAssets}
              updateAsset={updateAsset}
            />
          }
        />
        <Route
          path="/assets"
          element={<p>Asset List</p>}
        />
      </Routes>
    </MemoryRouter>
  );
}

// ========================================
// EDIT ASSET TESTS
// ========================================

test("Edit Asset prefills existing information", () => {
  renderEditForm();

  expect(
    screen.getByLabelText("Asset Name")
  ).toHaveValue("Dell Latitude 5440");

  expect(
    screen.getByLabelText("Serial Number")
  ).toHaveValue("DL5440-8XK21");

  expect(
    screen.getByLabelText("Status")
  ).toHaveValue("In Use");
});

test("Edit Asset rejects duplicate serial numbers", async () => {
  const user = userEvent.setup();
  const updateAsset = vi.fn();

  renderEditForm(updateAsset);

  const serialInput =
    screen.getByLabelText("Serial Number");

  await user.clear(serialInput);
  await user.type(serialInput, "LENOVO-123");

  await user.click(
    screen.getByRole("button", { name: "Save Changes" })
  );

  expect(
    screen.getByRole("alert")
  ).toHaveTextContent(
    "This serial number already exists."
  );

  expect(updateAsset).not.toHaveBeenCalled();
});

test("Edit Asset rejects future purchase dates", async () => {
  const user = userEvent.setup();
  const updateAsset = vi.fn();

  renderEditForm(updateAsset);

  const dateInput =
    screen.getByLabelText("Purchase Date");

  await user.clear(dateInput);
  await user.type(dateInput, "2099-01-01");

  await user.click(
    screen.getByRole("button", { name: "Save Changes" })
  );

  expect(
    screen.getByRole("alert")
  ).toHaveTextContent(
    "Purchase date cannot be in the future."
  );

  expect(updateAsset).not.toHaveBeenCalled();
});

test("Edit Asset saves valid changes", async () => {
  const user = userEvent.setup();
  const updateAsset = vi.fn();

  renderEditForm(updateAsset);

  const nameInput =
    screen.getByLabelText("Asset Name");

  await user.clear(nameInput);
  await user.type(nameInput, "Dell Latitude 5550");

  await user.click(
    screen.getByRole("button", { name: "Save Changes" })
  );

  expect(updateAsset).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      name: "Dell Latitude 5550",
      serialNumber: "DL5440-8XK21",
    })
  );

  expect(
    screen.getByText("Asset List")
  ).toBeInTheDocument();
});
