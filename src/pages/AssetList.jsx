import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

export const PAGE_SIZE = 5;

function AssetList({ deleteAsset }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(0);

  const [pageData, setPageData] = useState({
    content: [],
    page: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Increase this number to load the current page again (after delete)
  const [reloadKey, setReloadKey] = useState(0);

  // Load the requested page from Spring Boot.
  // Search and status are sent to the backend, so they work across
  // all assets and not only the five assets on the current page.
  useEffect(() => {
    let ignore = false;

    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (statusFilter !== "All") {
      params.set("status", statusFilter);
    }

    async function loadAssets() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/assets?${params}`
        );
        if (!response.ok) {
          // 400 has { error }, 500 has an empty body
          const body = await response.json().catch(() => ({}));
          if (!ignore) {
            setError(body.error || "Failed to load assets.");
          }
          return;
        }

        const result = await response.json();

        if (ignore) return;

        if (!result || !Array.isArray(result.content)) {
          setError("Unexpected response from the server.");
          return;
        }

        // If the page no longer exists (for example after a delete),
        // move back to the last page that has data.
        if (result.totalPages > 0 && page >= result.totalPages) {
          setPage(result.totalPages - 1);
          return;
        }

        setPageData(result);
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

    loadAssets();

    // Ignore old responses when the user types quickly
    return () => {
      ignore = true;
    };
  }, [page, search, statusFilter, reloadKey]);

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(0);
  }

  function handleStatusChange(e) {
    setStatusFilter(e.target.value);
    setPage(0);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (confirmed) {
      await deleteAsset(id);
      setReloadKey((key) => key + 1);
    }
  }

  const assets = pageData.content;
  const displayedPage = pageData.totalPages === 0 ? 0 : page + 1;

  return (
    <div>
      <h1>Assets</h1>

      <p>Total: {pageData.totalElements}</p>

      <div>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search by name, serial number, or employee"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <label htmlFor="statusFilter">Filter by Status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="All">All</option>
          <option value="In Use">In Use</option>
          <option value="In Stock">In Stock</option>
          <option value="Under Repair">Under Repair</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {loading && <p>Loading assets...</p>}

      {!loading && !error && assets.length === 0 && (
        <p>No assets found.</p>
      )}

      {!error && assets.length > 0 && (
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
            {assets.map((asset) => (
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

                  {deleteAsset && (
                    <>
                      {" | "}
                      <button onClick={() => handleDelete(asset.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <button
          type="button"
          onClick={() => setPage((p) => p - 1)}
          disabled={loading || pageData.first}
        >
          Previous
        </button>

        <span>
          {" "}Page {displayedPage} of {pageData.totalPages}{" "}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || pageData.last}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AssetList;
