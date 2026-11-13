import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

function AssetDetail() {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  // Load the selected asset from Spring Boot
  useEffect(() => {
    let ignore = false;

    async function loadAsset() {
      setLoading(true);
      setNotFound(false);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/assets/${encodeURIComponent(id)}`
        );

        if (ignore) return;

        // 404 = no asset with this ID
        // 400 = the ID is not a number, so it cannot exist either
        if (response.status === 404 || response.status === 400) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          // 500 has an empty body
          setError("Failed to load the asset.");
          return;
        }

        const result = await response.json();

        if (ignore) return;

        setAsset(result);
      } catch {
        if (!ignore) {
          setError("Cannot connect to the Spring Boot server.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAsset();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <p>Loading asset...</p>;
  }

  if (notFound) {
    return (
      <div>
        <h1>Asset Not Found</h1>
        <p>The requested asset does not exist.</p>
        <Link to="/assets">Back to Assets</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Asset Details</h1>
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
        <Link to="/assets">Back to Assets</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Asset Details</h1>

      <p><strong>Name:</strong> {asset.name}</p>
      <p><strong>Type:</strong> {asset.type}</p>
      <p><strong>Serial Number:</strong> {asset.serialNumber}</p>
      <p>
        <strong>Assigned To:</strong>{" "}
        {asset.assignedTo || "Unassigned"}
      </p>
      <p><strong>Status:</strong> {asset.status}</p>
      <p><strong>Purchase Date:</strong> {asset.purchaseDate}</p>

      <Link to={`/edit/${asset.id}`}>Edit Asset</Link>
      {" | "}
      <Link to="/assets">Back to Assets</Link>
    </div>
  );
}

export default AssetDetail;
