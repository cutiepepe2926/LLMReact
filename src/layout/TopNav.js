import siteLogo from "./Site_logo.svg";
import bell from "./Bell.svg";
import help from "./Help.svg";
import profile from "./Profile.svg";
import "./TopNav.css";
import { Outlet } from "react-router-dom"; 

export default function TopNav() {
    return (
        <> 
            <header className="top-header">
                <div className="logo">
                    <img
                        src={siteLogo}
                        alt="site logo"
                        className="site-logo"
                        style={{ width: 150, height: 50 }}
                    />
                </div>

                <div className="header-right">
                    <div className="icon-group">
                        <div className="icon-circle">
                            <img src={bell} alt="clock icon" className="clock-icon" style={{ width: 25 }} />
                        </div>
                        <div className="icon-circle">
                            <img src={help} alt="help icon" className="clock-icon" style={{ width: 25 }} />
                        </div>
                        <div className="icon-circle">
                            <img src={profile} alt="profile icon" className="clock-icon" style={{ width: 25 }} />
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </>
    );
}