import React from "react";
import siteLogo from "./Site_logo.svg";
import clock from "./Clock.svg";
import bell from "./Bell.svg";
import help from "./Help.svg";
import profile from "./Profile.svg";
import "./TopNav.css";


export default function TopNav() {
    return (
        <header className="top-header">
            <div className="logo">
                <img
                    src = {siteLogo}
                    alt = "site logo"
                    className="site-logo"
                    style={{ width: 150, height: 50 }}
                />
            </div>

            <div className="header-right">
                <img
                    src = {clock}
                    alt = "clock icon"
                    className="clock-icon"
                    style={{ width: 25 }}
                />
                <span>리포트 생성까지: 12:00:00</span>

                <div className="icon-group">
                    <div className="icon-circle">
                        <img
                            src = {bell}
                            alt = "clock icon"
                            className="clock-icon"
                            style={{ width: 25 }}
                        />
                    </div>
                    <div className="icon-circle">
                        <img
                            src = {help}
                            alt = "clock icon"
                            className="clock-icon"
                            style={{ width: 25 }}
                        />
                    </div>
                    <div className="icon-circle">
                        <img
                            src = {profile}
                            alt = "clock icon"
                            className="clock-icon"
                            style={{ width: 25 }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
