import React from "react";
import "./NotifyIntegrationMiniGrid.css";

export default function NotifyIntegrationMiniGrid() {
    const [emailOn, setEmailOn] = React.useState(true);
    const [pushOn, setPushOn] = React.useState(true);
    const [soundOn, setSoundOn] = React.useState(false);

    // 데모: 깃허브 연결 상태
    const githubConnected = true;

    return (
        <div className="nig-card">
            <div className="nig-section-title">알림 채널</div>

            <div className="nig-row">
                <div className="nig-label">이메일 알림:</div>
                <ToggleText on={emailOn} setOn={setEmailOn} />
            </div>

            <div className="nig-row">
                <div className="nig-label">웹푸시 알림:</div>
                <ToggleText on={pushOn} setOn={setPushOn} />
            </div>

            <div className="nig-row">
                <div className="nig-label">알림 사운드:</div>
                <ToggleText on={soundOn} setOn={setSoundOn} />
            </div>

            <div className="nig-divider" />

            <div className="nig-section-title">GitHub 연동</div>

            <div className="nig-row">
                <div className="nig-label">연결 상태:</div>
                <div className={`nig-status ${githubConnected ? "on" : "off"}`}>
                    {githubConnected ? "CONNECTED" : "DISCONNECTED"}
                </div>
            </div>
        </div>
    );
}

function ToggleText({ on, setOn }) {
    return (
        <button
            type="button"
            className={`nig-toggle ${on ? "on" : "off"}`}
            onClick={() => setOn((v) => !v)}
        >
            [{on ? "ON" : "OFF"}]
        </button>
    );
}
