import React from "react";
import "./MemberMiniGrid.css";

export default function MemberMiniGrid({ members }) {
    return (
        <div className="mm-card">
            <div className="mm-header-row">
                <div>프로필</div>
                <div>닉네임(아이디)</div>
                <div>역할</div>
                <div>상태</div>
                <div>작업</div>
            </div>

            <div className="mm-body">
                {members.map((m) => (
                    <div className="mm-row" key={m.id}>
                        <div className={`mm-avatar ${m.type}`} />

                        <div className="mm-name">{m.name}</div>

                        <div className="mm-role">
                            {m.type === "owner" ? (
                                <span className="mm-pill">[OWNER]</span>
                            ) : (
                                <select defaultValue={m.role} className="mm-select">
                                    <option value="ADMIN">[ADMIN]</option>
                                    <option value="MEMBER">[MEMBER]</option>
                                </select>
                            )}
                        </div>

                        <div className="mm-status">
                            <span className="mm-pill">[{m.status}]</span>
                        </div>

                        <div className="mm-action">
                            {m.type === "owner" && <span className="mm-disabled">[비활성화]</span>}
                            {m.type === "admin" && <button className="mm-link">[추방]</button>}
                            {m.type === "me" && <button className="mm-link">[나가기]</button>}
                            {m.type === "invited" && <button className="mm-link">[초대취소]</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
