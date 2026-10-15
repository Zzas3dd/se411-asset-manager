import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Asset Manager</h2>
      <ul>
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/assets">Assets</NavLink>
        </li>
        <li>
          <NavLink to="/add">Add Asset</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
