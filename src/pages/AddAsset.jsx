
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddAsset({ addAsset, assets }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    serialNumber: "",
    assignedTo: "",
    status: "",
    purchaseDate: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Check required fields
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

    // Check purchase date
    const today = new Date();
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

    if (selectedDate > today) {
      setError("Purchase date cannot be in the future.");
      return;
    }

    // Check duplicate serial numbers
    const duplicate = assets.some(
      (asset) =>
        asset.serialNumber.trim().toLowerCase() ===
        formData.serialNumber.trim().toLowerCase()
    );

    if (duplicate) {
      setError("This serial number already exists.");
      return;
    }

    // Add the new asset
    setError("");

    addAsset({
      ...formData,
      name: formData.name.trim(),
      serialNumber: formData.serialNumber.trim(),
      assignedTo: formData.assignedTo.trim(),
    });

    // Return to asset list
    navigate("/assets");
  }

  return (
    <div>
      <h1>Add Asset</h1>

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

        <label htmlFor="serialNumber">Serial Number</label>
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
          Add Asset
        </button>
      </form>
    </div>
  );
}

export default AddAsset;
