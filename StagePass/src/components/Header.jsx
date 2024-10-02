import SiteName from "./SiteName";

function Header() {
    return (
<header className="d-flex flex-wrap justify-content-between align-items-center py-3 px-4 mb-4 border-bottom">
  <div className="d-flex align-items-center">
    <div className="me-3">
      <SiteName/>
    </div>
  </div>
	<h3 id="tag-line" className="ms-3">Think of a tagline</h3>
  <div className="d-flex align-items-center ms-auto"> 
    <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3">
      <input type="search" className="form-control" placeholder="Search..." aria-label="Search"/>
    </form>
    
    <div className="dropdown">
      <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
        Users Name
      </button>
      <ul className="dropdown-menu">
        <li><a className="dropdown-item" href="#">Your Tickets</a></li>
        <li><a className="dropdown-item" href="#">Your Concert</a></li>
        <li><a className="dropdown-item" href="#">Plan a New Concert</a></li>
        <li><a className="dropdown-item" href="#">Settings</a></li>
        <li><a className="dropdown-item" href="#">Logout</a></li>
      </ul>
    </div>
  </div>
</header>

        )
    }
    export default Header;