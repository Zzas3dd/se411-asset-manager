# Architecture

## Overview

Asset Manager is a React app for managing company computers. It is built with Vite and uses React Router for the menu. In Part 1 the data is stored in a JavaScript array, so it resets when the page is refreshed.

## Folder structure

```
src/
  main.jsx            starts the app
  App.jsx             holds the asset list and the routes
  index.css           styles
  App.test.jsx        tests
  components/
    NavBar.jsx        the menu
  pages/
    Home.jsx          home page with totals
    AssetList.jsx     list of assets with delete
    AddAsset.jsx      form to add an asset
    EditAsset.jsx     form to edit an asset
    About.jsx         team names and student IDs
  data/
    assets.js         starting list of assets
```

## How the parts fit together

```
main.jsx
   |
 App.jsx  (assets list + addAsset, updateAsset, deleteAsset)
   |
   |-- NavBar (menu, shown on every page)
   |
   |-- Routes
         /           -> Home       (gets assets)
         /assets     -> AssetList  (gets assets, deleteAsset)
         /add        -> AddAsset   (gets addAsset)
         /edit/:id   -> EditAsset  (gets assets, updateAsset)
         /about      -> About
```

## Data

The list of assets is stored in `App.jsx` with `useState`. Each asset is an object:

| Field | Example |
| --- | --- |
| id | 1 |
| name | Dell Latitude 5440 |
| type | Laptop, Desktop or Monitor |
| serialNumber | DL5440-8XK21 |
| assignedTo | Sara Alqahtani (empty if not assigned) |
| status | In Use, In Stock, Under Repair or Retired |
| purchaseDate | 2024-02-11 |

`App.jsx` has three functions that change the list. They are passed to the pages as props.

| Function | What it does |
| --- | --- |
| `addAsset(newAsset)` | Gives the asset an id and adds it to the list |
| `updateAsset(updatedAsset)` | Replaces the asset that has the same id |
| `deleteAsset(id)` | Removes the asset with that id |

The functions always create a new array instead of changing the old one, because React only updates the screen when the state gets a new value.

## Why the data is in App.jsx

All pages need the same list. Keeping it in `App.jsx`, the parent of every page, means there is only one copy. When one page changes it, every page sees the change.

## Testing

Tests use Vitest and React Testing Library. They check that the menu shows all links, that each link opens the right page, and that the home page shows the correct total. Run them with `npm test`.

## Part 2

In Part 2, the three functions in `App.jsx` will call the backend instead of changing the array. The pages will not need many changes.
