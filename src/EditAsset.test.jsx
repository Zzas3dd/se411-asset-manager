import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import EditAsset from "./pages/EditAsset";

const API_URL = "http://localhost:8080/api/assets";

const existingAsset = {
  id: 1,
  name: "Dell Latitude 5440",
  type: "Laptop",
  serialNumber: "DL5440-8XK21",
  assignedTo: "Sara",
  status: "In Use",
  purchaseDate: "2024-02-11",
};

function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

// Fake backend: GET returns the asset, PUT returns putResponse
function mockBackend(putStatus = 200, putBody = null) {
  const mockFetch = vi.fn((url, options = {}) => {
    if ((options.method || "GET") === "GET") {
      return url === `${API_URL}/1`
        ? jsonResponse(200, existingAsset)
        : jsonResponse(404, { error: "Asset not found." });
    }
    return jsonResponse(putStatus, putBody);
  });
  vi.stubGlobal("fetch", mockFetch);
  return mockFetch;
}

function renderEditForm(path = "/edit/1", updateAsset = vi.fn()) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/edit/:id" element={<EditAsset updateAsset={updateAsset} />} />
        <Route path="/assets" element={<p>Asset List</p>} />
      </Routes>
    </MemoryRouter>
  );
}

test("Edit Asset loads the asset from the backend and prefills the form", async () => {
  const mockFetch = mockBackend();
  renderEditForm();

  expect(await screen.findByLabelText("Asset Name")).toHaveValue("Dell Latitude 5440");
  expect(screen.getByLabelText("Serial Number")).toHaveValue("DL5440-8XK21");
  expect(screen.getByLabelText("Status")).toHaveValue("In Use");

  expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/1`);
});

test("Edit Asset shows Not Found for an unknown ID", async () => {
  mockBackend();
  renderEditForm("/edit/99");

  expect(
    await screen.findByRole("heading", { name: "Asset Not Found" })
  ).toBeInTheDocument();
});

test("Edit Asset sends a PUT request and returns to the list", async () => {
  const user = userEvent.setup();
  const updated = { ...existingAsset, name: "Dell Latitude 5550" };
  const mockFetch = mockBackend(200, updated);
  const updateAsset = vi.fn();

  renderEditForm("/edit/1", updateAsset);

  const nameInput = await screen.findByLabelText("Asset Name");
  await user.clear(nameInput);
  await user.type(nameInput, "Dell Latitude 5550");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));

  expect(mockFetch).toHaveBeenCalledWith(
    `${API_URL}/1`,
    expect.objectContaining({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
  );

  const sentBody = JSON.parse(mockFetch.mock.calls[1][1].body);
  expect(sentBody.name).toBe("Dell Latitude 5550");
  expect(sentBody.serialNumber).toBe("DL5440-8XK21");

  expect(updateAsset).toHaveBeenCalledWith(updated);
  expect(await screen.findByText("Asset List")).toBeInTheDocument();
});

test("Edit Asset shows the backend error for a duplicate serial number", async () => {
  const user = userEvent.setup();
  mockBackend(400, { error: "This serial number already exists." });
  const updateAsset = vi.fn();

  renderEditForm("/edit/1", updateAsset);

  const serialInput = await screen.findByLabelText("Serial Number");
  await user.clear(serialInput);
  await user.type(serialInput, "LNT14-PF3Q9");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "This serial number already exists."
  );
  expect(updateAsset).not.toHaveBeenCalled();
});

test("Edit Asset rejects future purchase dates before calling the backend", async () => {
  const user = userEvent.setup();
  const mockFetch = mockBackend();

  renderEditForm();

  const dateInput = await screen.findByLabelText("Purchase Date");
  await user.clear(dateInput);
  await user.type(dateInput, "2099-01-01");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Purchase date cannot be in the future."
  );
  // Only the initial GET, no PUT
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("Edit Asset shows an error when the server is down", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  renderEditForm();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Cannot connect to the Spring Boot server."
  );
});
