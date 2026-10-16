import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import AssetList from "./pages/AssetList";
import AddAsset from "./pages/AddAsset";
import EditAsset from "./pages/EditAsset";
import About from "./pages/About";
import startingAssets from "./data/assets";

function App() {
  // All the assets are stored here, in one place.
  const [assets, setAssets] = useState(startingAssets);

  // Add a new asset to the list
  function addAsset(newAsset) {
    const assetWithId = { ...newAsset, id: Date.now() }; // simple unique id
    setAssets([...assets, assetWithId]);
  }

  // Replace the asset that has the same id
  function updateAsset(updatedAsset) {
    const newList = assets.map((asset) =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );
    setAssets(newList);
  }

  // Remove the asset with this id
  function deleteAsset(id) {
    const newList = assets.filter((asset) => asset.id !== id);
    setAssets(newList);
  }

  return (
    <BrowserRouter>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home assets={assets} />} />
          <Route
            path="/assets"
            element={<AssetList assets={assets} deleteAsset={deleteAsset} />}
          />
 <Route
  path="/add"
  element={<AddAsset addAsset={addAsset} assets={assets} />}
/>
          <Route
            path="/edit/:id"
            element={<EditAsset assets={assets} updateAsset={updateAsset} />}
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
