# Architecture

## Overview

Asset Manager is a React application for managing company IT assets, including laptops, desktops, and monitors. It is built using Vite and React Router for navigation.

In Part 1, asset data is stored in React state. Changes are temporary and reset when the page is refreshed.

The application supports viewing, adding, editing, and deleting assets, as well as searching and filtering the asset list.

## Folder Structure

```text
src/
  main.jsx                 Starts the application
  App.jsx                  Manages asset state and routes
  index.css                Application styles
  App.test.jsx             Navigation and application tests
  AssetForms.test.jsx      Add and Edit Asset tests
  AssetList.test.jsx       Asset list and delete tests

  components/
    NavBar.jsx             Navigation menu

  pages/
    Home.jsx               Home page with asset totals
    AssetList.jsx          Displays, searches, filters, and deletes assets
    AssetDetail.jsx        Displays information about one asset
    AddAsset.jsx           Form for adding an asset
    EditAsset.jsx          Form for editing an asset
    About.jsx              Team names and student IDs

  data/
    assets.js              Initial asset records
```

## How the Parts Fit Together

```text
main.jsx
   |
 App.jsx (assets state + CRUD functions)
   |
   |-- NavBar (navigation menu)
   |
   |-- Routes
         /             -> Home
         /assets       -> AssetList
         /assets/:id   -> AssetDetail
         /add          -> AddAsset
         /edit/:id     -> EditAsset
         /about        -> About
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| App | Stores asset state, manages CRUD functions, and configures routes |
| NavBar | Provides navigation between pages |
| Home | Displays asset summary information |
| AssetList | Displays assets and provides search, filtering, and deletion |
| AssetDetail | Displays detailed information about a selected asset |
| AddAsset | Adds new assets after validating input |
| EditAsset | Updates existing assets after validating input |
| About | Displays team member information |

## Data Management

The asset list is stored in `App.jsx` using React's `useState` hook.

Each asset is represented by a JavaScript object.

| Field | Example |
|---|---|
| id | 1 |
| name | Dell Latitude 5440 |
| type | Laptop, Desktop, or Monitor |
| serialNumber | DL5440-8XK21 |
| assignedTo | Sara Alqahtani |
| status | In Use, In Stock, Under Repair, or Retired |
| purchaseDate | 2024-02-11 |

### CRUD Functions

`App.jsx` contains three functions for modifying asset data.

| Function | Description |
|---|---|
| `addAsset(newAsset)` | Generates an ID and adds a new asset |
| `updateAsset(updatedAsset)` | Updates an existing asset by ID |
| `deleteAsset(id)` | Removes an asset by ID |

These functions update React state by creating new arrays instead of directly modifying the existing array.

### Data Flow

The application follows a parent-to-child data flow.

1. `App.jsx` stores the asset list.
2. Asset data and relevant functions are passed to pages through props.
3. Pages display the data and invoke functions when users perform actions.
4. React updates the interface when the asset state changes.

Examples:

- `Home` receives `assets`.
- `AssetList` receives `assets` and `deleteAsset`.
- `AssetDetail` receives the information needed to display the selected asset.
- `AddAsset` receives `addAsset` and `assets`.
- `EditAsset` receives `assets` and `updateAsset`.

## Form Validation

The Add Asset and Edit Asset components validate user input before saving.

Validation includes:

- Required fields cannot be empty.
- Serial numbers must be unique, ignoring letter case.
- Purchase dates must be valid.
- Future purchase dates are rejected.
- Employee assignment is optional.
- Validation errors are displayed to users.

The Edit Asset form also loads the existing asset information before editing.

## Testing

The project uses **Vitest** and **React Testing Library** for automated testing.

| Test File | Purpose |
|---|---|
| `App.test.jsx` | Tests navigation and application rendering |
| `AssetForms.test.jsx` | Tests Add Asset and Edit Asset functionality and validation |
| `AssetList.test.jsx` | Tests asset list functionality |

The tests cover navigation, form validation, successful asset creation and editing, and asset list behavior.

### Test Results

- Test files: 3 passed
- Automated tests: 21 passed
- Failed tests: 0

Run tests using:

```bash
npm run test
```

The production build can be verified using:

```bash
npm run build
```

The latest production build completed successfully.

## Part 2

In Part 2, the application will integrate with a Spring Boot backend.

The current React state-based CRUD operations will be adapted to communicate with backend endpoints.

This will allow asset data to be stored persistently rather than being lost when the page is refreshed.