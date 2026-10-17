import { useState } from "react";
import { Link } from "react-router-dom";

function AssetList({ assets, deleteAsset }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      asset.assignedTo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (confirmed) {
      deleteAsset(id);
    }
  }

  return (
    <div>
      <h1>Assets</h1>

      <p>Total: {assets.length}</p>

      <div>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search by name, serial number, or employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="statusFilter">Filter by Status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="In Use">In Use</option>
          <option value="In Stock">In Stock</option>
          <option value="Under Repair">Under Repair</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {filteredAssets.length === 0 ? (
        <p>No assets found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Purchase Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.type}</td>
                <td>{asset.serialNumber}</td>
                <td>{asset.assignedTo || "Unassigned"}</td>
                <td>{asset.status}</td>
                <td>{asset.purchaseDate}</td>

                <td>
                  <Link to={`/assets/${asset.id}`}>View</Link>

                  {" | "}

                  <Link to={`/edit/${asset.id}`}>Edit</Link>

                 {" | "}

                <button onClick={() => handleDelete(asset.id)}>
                   Delete
                 </button>
                 
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AssetList;