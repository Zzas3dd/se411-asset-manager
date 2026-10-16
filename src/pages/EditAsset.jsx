
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditAsset({ assets, updateAsset }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find the asset using its ID
  const asset = assets.find(
    (item) => item.id === Number(id)
  );

  // Prefill the form with existing asset information
  const [formData, setFormData] = useState(() => ({
    name: asset?.name || "",
    type: asset?.type || "",
    serialNumber: asset?.serialNumber || "",
    assignedTo: asset?.assignedTo || "",
    status: asset?.status || "",
    purchaseDate: asset?.purchaseDate || "",
  }));

  const [error, setError] = useState("");

  // Update form fields when the user types
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // Validate and save changes
  function handleSubmit(e) {
    e.preventDefault();

    if (!asset) {
      setError("Asset not found.");
      return;
    }

    // 1. Required field validation
    if (
      !formData.name.trim() ||
      !formData.type ||
      !formData.serialNumber.trim() ||
      !formData.status ||
      !formData.purchaseDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // 2. Validate purchase date
    const selectedDate = new Date(
      formData.purchaseDate + "T00:00:00"
    );

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getFullYear() !==
        Number(formData.purchaseDate.slice(0, 4)) ||
      selectedDate.getMonth() + 1 !==
        Number(formData.purchaseDate.slice(5, 7)) ||
      selectedDate.getDate() !==
        Number(formData.purchaseDate.slice(8, 10))
    ) {
      setError("Please enter a valid purchase date.");
      return;
    }

    // Get today's local date
    const today = new Date();

    const todayString =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // 3. Prevent future purchase dates
    if (formData.purchaseDate > todayString) {
      setError("Purchase date cannot be in the future.");
      return;
    }

    // 4. Check for duplicate serial numbers
    // Ignore the asset currently being edited
    const duplicate = assets.some(
      (item) =>
        item.id !== asset.id &&
        item.serialNumber.trim().toLowerCase() ===
          formData.serialNumber.trim().toLowerCase()
    );

    if (duplicate) {
      setError("This serial number already exists.");
      return;
    }

    // 5. Save the updated asset
    const updatedAsset = {
      ...asset,
      ...formData,
      name: formData.name.trim(),
      serialNumber: formData.serialNumber.trim(),
      assignedTo: formData.assignedTo.trim(),
    };

    updateAsset(updatedAsset);

    // 6. Return to asset list
    navigate("/assets");
  }

  // Handle invalid asset IDs
  if (!asset) {
    return (
      <div>
        <h1>Asset Not Found</h1>
        <p>The requested asset does not exist.</p>
        <button onClick={() => navigate("/assets")}>
          Back to Assets
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Edit Asset</h1>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <label htmlFor="name">Asset Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <label htmlFor="type">Asset Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="">Select Type</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Monitor">Monitor</option>
        </select>

        <label htmlFor="serialNumber">
          Serial Number
        </label>
        <input
          id="serialNumber"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
        />

        <label htmlFor="assignedTo">
          Assigned To (Optional)
        </label>
        <input
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
        />

        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="">Select Status</option>
          <option value="In Use">In Use</option>
          <option value="In Stock">In Stock</option>
          <option value="Under Repair">
            Under Repair
          </option>
          <option value="Retired">Retired</option>
        </select>

        <label htmlFor="purchaseDate">
          Purchase Date
        </label>
        <input
          id="purchaseDate"
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
        />

        <button type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditAsset;
