import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import startingAssets from "../data/assets";
import { mockAssetBackend } from "./mockBackend";

// App.jsx loads assets from Spring Boot on startup, so every test gets
// the fake backend with the Part 1 data by default (no real network calls).
// Tests can still replace it with their own mock.
beforeEach(() => {
  mockAssetBackend(startingAssets);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.pushState({}, "", "/"); // start every test on the home page
});
