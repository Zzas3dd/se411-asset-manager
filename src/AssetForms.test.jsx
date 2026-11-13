
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

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

  const savedAsset = {
    id: 100,
    name: "ASUS Zenbook",
    type: "Laptop",
    serialNumber: "ASUS-NEW-123",
    assignedTo: "",
    status: "In Stock",
    purchaseDate: "2026-01-10",
  };

  // Pretend Spring Boot successfully saved the asset (POST),
  // then returns it in the paginated asset list (GET)
  // The list is empty until the POST happens (App loads the list on startup)
  let saved = false;
  const mockFetch = vi.fn(async (url, options) => {
    if (options?.method === "POST") {
      saved = true;
      return { ok: true, status: 201, json: async () => savedAsset };
    }
    const content = saved ? [savedAsset] : [];
    return {
      ok: true,
      status: 200,
      json: async () => ({
        content,
        page: 0,
        size: 5,
        totalElements: content.length,
        totalPages: content.length ? 1 : 0,
        first: true,
        last: true,
      }),
    };
  });

  vi.stubGlobal("fetch", mockFetch);

  try {
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

    // Verify that React sent the asset to Spring Boot
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/assets",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    // Verify that the saved asset appears in the list
    expect(
      await screen.findByText("ASUS Zenbook")
    ).toBeInTheDocument();

  } finally {
    // Restore fetch so other tests are unaffected
    vi.unstubAllGlobals();
  }
});
