// Member 3 will build this page (table + delete button).
// Props: assets (the list), deleteAsset(id)

function AssetList({ assets }) {
  return (
    <div>
      <h1>Assets</h1>
      <p>Total: {assets.length}</p>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>{asset.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default AssetList;
