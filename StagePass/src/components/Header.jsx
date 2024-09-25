import SiteName from "./SiteName";

function Header() {
    return (
        <header id="header" className="w3-container w3-deep-purple">
        <div id="nameTag">
            <SiteName/>
            <h3 id="tag-line">Think of a tagline</h3>
        </div>
        <div id="">
            <a href="/myprofile">Profile</a>
        </div>
    </header>
        )
    }
    export default Header;