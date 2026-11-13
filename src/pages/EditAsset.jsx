import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

const API_URL = `${API_BASE_URL}/api/assets`;

const emptyForm = {
  name: "",
  type: "",
  serialNumber: "",
  assignedTo: "",
  status: "",
  purchaseDate: "",
};

function EditAsset({ updateAsset }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  // 1. Load the selected asset from Spring Boot (GET /api/assets/{id})
  useEffect(() => {
    let cancelled = false;

    async function loadAsset() {
      setLoading(true);
      setNotFound(false);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`);

        // 404 = no asset with this ID, 400 = ID is not a number
        if (response.status === 404 || response.status === 400) {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load asset.");
        }

        const asset = await response.json();

        // Prefill the form with the existing information
        if (!cancelled) {
          setFormData({
            name: asset.name || "",
            type: asset.type || "",
            serialNumber: asset.serialNumber || "",
            assignedTo: asset.assignedTo || "",
            status: asset.status || "",
            purchaseDate: asset.purchaseDate || "",
          });
        }
      } catch {
        if (!cancelled) setError("Cannot connect to the Spring Boot server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAsset();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Update form fields when the user types
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // 2. Validate and send the changes (PUT /api/assets/{id})
  async function handleSubmit(e) {
    e.preventDefault();

    // Required field validation
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

    // Validate purchase date
    const selectedDate = new Date(formData.purchaseDate + "T00:00:00");

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getFullYear() !== Number(formData.purchaseDate.slice(0, 4)) ||
      selectedDate.getMonth() + 1 !== Number(formData.purchaseDate.slice(5, 7)) ||
      selectedDate.getDate() !== Number(formData.purchaseDate.slice(8, 10))
    ) {
      setError("Please enter a valid purchase date.");
      return;
    }

    // Prevent future purchase dates
    const today = new Date();
    const todayString =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    if (formData.purchaseDate > todayString) {
      setError("Purchase date cannot be in the future.");
      return;
    }

    // Duplicate serial numbers are checked by the backend,
    // which can see every asset (not just the ones loaded in React).

    const changes = {
      ...formData,
      name: formData.name.trim(),
      serialNumber: formData.serialNumber.trim(),
      assignedTo: formData.assignedTo.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      // Error responses may have an empty body (e.g. 500)
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || "Failed to update asset.");
        return;
      }

      // Keep the shared React data in sync with the backend
      if (updateAsset) {
        updateAsset(result);
      }

      // Return to the asset list
      navigate("/assets");
    } catch {
      setError("Cannot connect to the Spring Boot server.");
    }
  }

  if (loading) {
    return <p>Loading asset...</p>;
  }

  // Handle invalid asset IDs
  if (notFound) {
    return (
      <div>
        <h1>Asset Not Found</h1>
        <p>The requested asset does not exist.</p>
        <button onClick={() => navigate("/assets")}>Back to Assets</button>
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
        <input id="name" name="name" value={formData.name} onChange={handleChange} />

        <label htmlFor="type">Asset Type</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange}>
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

        <label htmlFor="assignedTo">Assigned To (Optional)</label>
        <input
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
        />

        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="">Select Status</option>
          <option value="In Use">In Use</option>
          <option value="In Stock">In Stock</option>
          <option value="Under Repair">Under Repair</option>
          <option value="Retired">Retired</option>
        </select>

        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          id="purchaseDate"
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditAsset;
