import { Link } from "react-router-dom";

function Home({ assets }) {
  const inUse = assets.filter((asset) => asset.status === "In Use").length;

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the company computer asset manager.</p>

      <div className="boxes">
        <div className="box">
          <h3>Total Assets</h3>
          <p className="number">{assets.length}</p>
        </div>
        <div className="box">
          <h3>In Use</h3>
          <p className="number">{inUse}</p>
        </div>
      </div>

      <Link to="/assets" className="button">View Assets</Link>
    </div>
  );
}

export default Home;
