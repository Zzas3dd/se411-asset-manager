import { Link, useParams } from "react-router-dom";

function AssetDetail({ assets }) {
  const { id } = useParams();

  const asset = assets.find(
    (item) => item.id === Number(id)
  );

  if (!asset) {
    return (
      <div>
        <h1>Asset Not Found</h1>
        <p>The requested asset does not exist.</p>
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