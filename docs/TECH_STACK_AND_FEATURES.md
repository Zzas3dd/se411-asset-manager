# Technology Stack and Features

## 1. Technology Stack

The project uses the following technologies:

- React.js — frontend framework used to build the user interface.
- Vite — development and build tool used to run the React project.
- JavaScript — main programming language.
- React Router — used for navigation between pages.
- React State — used to store asset data in memory for Part 1.
- Vitest — used for automated testing.
- React Testing Library — used to test user interactions and component behavior.
- GitHub — used for source-code hosting and collaboration.
- VS Code — used as the development environment.

## 2. Main Features

The Asset Management System allows users to manage company IT assets such as laptops, desktops, and monitors.

Implemented features include:

- View all assets in a table.
- View detailed information for a selected asset.
- Add a new asset.
- Edit an existing asset.
- Delete an asset with confirmation.
- Search assets by name, serial number, or assigned employee.
- Filter assets by status.
- Navigate between Home, Assets, Add Asset, and About pages.
- Display team-member information on the About page.
- Validate asset forms before submission.

## 3. Asset Information

Each asset contains:

- Asset name
- Asset type
- Serial number
- Assigned employee
- Status
- Purchase date
- Unique internal ID

## 4. Validation Features

The application validates:

- Required fields.
- Duplicate serial numbers.
- Invalid purchase dates.
- Future purchase dates.

The Assigned To field is optional.

## 5. Data Storage

For Part 1, data is stored only in React state and JavaScript objects.

No database or backend is used.

This means changes are temporary and reset when the application is refreshed.

## 6. Search and Filtering

The Assets page supports:

- Searching by asset name.
- Searching by serial number.
- Searching by assigned employee.
- Filtering by asset status.

Available statuses include:

- In Use
- In Stock
- Under Repair
- Retired

## 7. Automated Testing

The project uses Vitest and React Testing Library.

Automated tests cover:

- Application rendering.
- Navigation.
- Add Asset form.
- Required-field validation.
- Duplicate serial numbers.
- Purchase-date validation.
- Successful asset creation.
- Edit form prepopulation.
- Successful asset updates.
- Asset listing.
- Search functionality.
- Status filtering.
- Delete confirmation and deletion behavior.

Current test result:

- Test files: 3 passed
- Total tests: 18 passed
- Failed tests: 0

## 8. Project Structure

The project is organized into:

- `src/components` — reusable interface components.
- `src/pages` — application pages.
- `src/data` — initial asset data.
- `src` test files — automated tests.
- `docs` — project documentation.

## 9. Part 1 Scope

This project implements only the frontend.

The backend and database will be developed later in Part 2.