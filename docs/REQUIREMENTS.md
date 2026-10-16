# Requirements Specification
# Asset Management System — Requirements Specification

**Course:** SE411 — Software Construction  
**Project:** Asset Management System  
**Part:** 1 — React Frontend

## 1. Project Overview

The Asset Management System is a React-based web application designed to manage company IT assets, including laptops, desktops, and monitors.

The system allows users to view, add, edit, and delete asset records through a user-friendly interface.

For Part 1, asset information is stored in React state without a backend or database. Data changes are temporary and are reset when the application is refreshed.

## 2. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall display a list of available IT assets. |
| FR-02 | The system shall allow users to add new assets. |
| FR-03 | The system shall allow users to edit existing asset information. |
| FR-04 | The system shall allow users to delete assets. |
| FR-05 | The system shall provide navigation between Home, Assets, Add Asset, and About pages. |
| FR-06 | The system shall automatically generate a unique internal ID for newly added assets. |
| FR-07 | The system shall display existing asset information when opening the Edit Asset form. |
| FR-08 | The system shall validate asset information before adding or updating records. |
| FR-09 | The system shall prevent duplicate asset serial numbers, ignoring letter case. |
| FR-10 | The system shall display validation error messages when invalid information is submitted. |
| FR-11 | The system shall redirect users to the asset list after successfully adding or editing an asset. |

## 3. Asset Data Requirements

Each asset shall contain the following information:

| Field | Description | Required |
|---|---|---|
| ID | Unique internal asset identifier | Automatically generated |
| Asset Name | Name of the asset | Yes |
| Asset Type | Laptop, Desktop, or Monitor | Yes |
| Serial Number | Unique serial number | Yes |
| Assigned To | Employee assigned to the asset | No |
| Status | In Use, In Stock, Under Repair, or Retired | Yes |
| Purchase Date | Date the asset was purchased | Yes |

## 4. Input Validation Requirements

**VR-01 — Required Fields**

The system shall reject submissions when the asset name, type, serial number, status, or purchase date is missing.

**VR-02 — Unique Serial Numbers**

The system shall prevent users from adding or editing an asset with a serial number already assigned to another asset.

**VR-03 — Valid Purchase Date**

The system shall reject invalid purchase dates.

**VR-04 — Future Purchase Dates**

The system shall reject purchase dates later than the current date.

**VR-05 — Optional Employee Assignment**

The system shall allow the Assigned To field to remain empty.

**VR-06 — Error Messages**

The system shall display clear error messages when validation fails.

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | The application shall be implemented using React and JavaScript. |
| NFR-02 | The application shall provide a simple and understandable user interface. |
| NFR-03 | The application shall use React Router for navigation between pages. |
| NFR-04 | The application shall use reusable components and maintain organized source files. |
| NFR-05 | The application shall use React state to manage asset information during the current session. |
| NFR-06 | The application shall provide automated tests using Vitest and React Testing Library. |
| NFR-07 | The application shall provide clear feedback when form validation fails. |

## 6. Assumptions and Constraints

- The application is developed for SE411 Part 1.
- The frontend is implemented using React.
- No backend server or database is included in Part 1.
- Asset information is stored temporarily in memory.
- Changes are lost when the page is refreshed.
- Authentication and user accounts are outside the scope of Part 1.
- Asset types are limited to Laptop, Desktop, and Monitor.
- Asset statuses are limited to In Use, In Stock, Under Repair, and Retired.

## 7. Acceptance Criteria

The application will satisfy the requirements when:

1. Users can navigate between the main application pages.
2. Existing assets are displayed correctly.
3. Users can successfully add an asset with valid information.
4. Users can edit an existing asset and save changes.
5. Users can delete an existing asset.
6. Empty required fields are rejected.
7. Duplicate serial numbers are rejected.
8. Invalid and future purchase dates are rejected.
9. Existing asset information appears in the Edit Asset form.
10. Automated tests execute successfully.

## 8. Testing

The application uses **Vitest** and **React Testing Library** for automated testing.

The following functionality has been tested:

- Navigation and application rendering
- Add Asset form rendering
- Required-field validation
- Duplicate serial number validation
- Future purchase date validation
- Successful asset creation
- Edit Asset form prepopulation
- Duplicate serial number validation during editing
- Future purchase date validation during editing
- Successful asset updates

**Latest test results:**
- Test files: 2 passed
- Total tests: 14 passed
- Failed tests: 0

## 9. AI Assistance

GitHub Copilot is used to assist in generating and reviewing the requirements specification as part of the AI-assisted development process for SE411 Part 1.

All generated requirements should be reviewed to ensure they accurately reflect the implemented application.
