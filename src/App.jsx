import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import AssetList from "./pages/AssetList";
import AddAsset from "./pages/AddAsset";
import EditAsset from "./pages/EditAsset";
import About from "./pages/About";
import AssetDetail from "./pages/AssetDetail";
import { API_BASE_URL } from "./api/config";

// The backend allows at most 100 assets per page
const ALL_ASSETS_URL = `${API_BASE_URL}/api/assets?page=0&size=100`;

function App() {
  // Spring Boot is the source of truth for asset data.
  // AssetList, AssetDetail and EditAsset load their own data from the API.
  // This copy is only for pages that need every asset:
  // Home (totals) and AddAsset (duplicate serial check before POST).
  const [assets, setAssets] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadAssets = useCallback(async () => {
    try {
      const response = await fetch(ALL_ASSETS_URL);
      if (!response.ok) throw new Error("Request failed");

      const result = await response.json();
      if (result && Array.isArray(result.content)) {
        setAssets(result.content);
        setLoadError("");
      }
    } catch {
      setLoadError("Cannot connect to the Spring Boot server.");
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Called after the backend confirms a new asset (POST returned 201)
  function addAsset(savedAsset) {
    setAssets((previous) => [...previous, savedAsset]);
  }

  // Called after the backend confirms an update (PUT returned 200)
  function updateAsset(savedAsset) {
    setAssets((previous) =>
      previous.map((asset) =>
        asset.id === savedAsset.id ? savedAsset : asset
      )
    );
  }

  return (
    <BrowserRouter>
      <NavBar />
      <div className="container">
        {loadError && (
          <p style={{ color: "red" }}>{loadError}</p>
        )}
        <Routes>
          <Route path="/" element={<Home assets={assets} />} />
          {/* No deleteAsset prop: Part 2 has no DELETE endpoint,
              so AssetList hides the Delete button. */}
          <Route path="/assets" element={<AssetList />} />
          <Route
            path="/add"
            element={<AddAsset addAsset={addAsset} assets={assets} />}
          />
          <Route
            path="/edit/:id"
            element={<EditAsset updateAsset={updateAsset} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
