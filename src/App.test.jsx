import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("menu shows all the links", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Assets" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Add Asset" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
});

test("home page shows the total number of assets", () => {
  render(<App />);
  expect(screen.getByText("Total Assets")).toBeInTheDocument();
  expect(screen.getByText("6")).toBeInTheDocument();
});

test("clicking About opens the about page with the team", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "About" }));
  expect(screen.getByText("Team Members")).toBeInTheDocument();
  expect(screen.getByText("Student ID")).toBeInTheDocument();
});

test("clicking Assets opens the assets page", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "Assets" }));
  expect(screen.getByText("Dell Latitude 5440")).toBeInTheDocument();
});

test("clicking Add Asset opens the add page", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("link", { name: "Add Asset" }));
  expect(screen.getByRole("heading", { name: "Add Asset" })).toBeInTheDocument();
});
