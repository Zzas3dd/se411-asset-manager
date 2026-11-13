import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "./App";
import startingAssets from "./data/assets";
import { mockAssetBackend } from "./test/mockBackend";

test("menu shows all the links", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Assets" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Add Asset" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
});

test("home page shows the total number of assets from the backend", async () => {
  const fetchMock = mockAssetBackend(startingAssets);
  render(<App />);
  expect(screen.getByText("Total Assets")).toBeInTheDocument();
  expect(await screen.findByText("6")).toBeInTheDocument();
  // App loads every asset in one request (max page size is 100)
  expect(String(fetchMock.mock.calls[0][0])).toContain("/api/assets?page=0&size=100");
  vi.unstubAllGlobals();
});

test("edit page loads the asset from the backend", async () => {
  mockAssetBackend(startingAssets);
  window.history.pushState({}, "", "/edit/2");
  render(<App />);
  expect(await screen.findByDisplayValue("Lenovo ThinkPad T14")).toBeInTheDocument();
  vi.unstubAllGlobals();
});

test("clicking About opens the about page with the team", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "About" }));
  expect(screen.getByText("Team Members")).toBeInTheDocument();
  expect(screen.getByText("Student ID")).toBeInTheDocument();
});

test("clicking Assets opens the assets page", async () => {
  // The asset list now loads its data from Spring Boot
  mockAssetBackend(startingAssets);
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "Assets" }));
  expect(await screen.findByText("Dell Latitude 5440")).toBeInTheDocument();
  vi.unstubAllGlobals();
});

test("clicking Add Asset opens the add page", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "Add Asset" }));
  expect(screen.getByRole("heading", { name: "Add Asset" })).toBeInTheDocument();
});
