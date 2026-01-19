import { useState, useEffect, useRef } from 'react'
import siteLogo from "./Site_logo.svg";
import bell from "./Bell.svg";
import help from "./Help.svg";
import "./TopNav.css";
import { Outlet } from "react-router-dom"; 
import Profile from '../component/modal/Profile';

export default function TopNav() {

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const profileRef = useRef(null);

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    // 외부 클릭 감지 로직 추가
    useEffect(() => {
        const handleClickOutside = (event) => {
            // profileRef가 현재 존재하고, 클릭한 대상(event.target)이 profileRef 내부가 아니라면
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false); // 모달 닫기
            }
        };

        // 문서 전체에 클릭 이벤트 리스너 추가
        document.addEventListener('mousedown', handleClickOutside);
        
        // 컴포넌트가 언마운트될 때 리스너 제거 (메모리 누수 방지)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                        <div className="icon-circle" style={{position: 'relative'}} ref={profileRef}>
                            <img 
                                src="/img/Profile.svg" 
                                alt="profile icon" 
                                className="profile"
                                onClick={toggleProfile}
                                style={{ width: 25 }} 
                            />

                            {isProfileOpen && <Profile/>}
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