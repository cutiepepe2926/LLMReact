import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Profile from '../component/modal/Profile';
import "./TopNav.css";
import { api } from "../utils/api";



// import siteLogo from "./Site_logo.svg";
// import bell from "./Bell.svg";
// import help from "./Help.svg";


// Icons
const Icons = {
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Help: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
};

export default function TopNav() {
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileImg, setProfileImg] = useState(null);
    
    const profileRef = useRef(null);

    //  로그인 또는 회원가입 페이지인지 확인하는 변수
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    // 사용자 이미지 가져오기
    useEffect(() => {
        if (!isAuthPage) { // 로그인 페이지가 아닐 때만 호출
            const fetchProfile = async () => {
                try {
                    const data = await api.get("/api/user/info");
                    setProfileImg(data.filePath); // DB에 저장된 S3 URL 또는 null
                } catch (error) {
                    console.error("탑네비 사용자 정보 로드 실패", error);
                }
            };
            fetchProfile();
        }
    }, [isAuthPage, location.pathname]); // 페이지 이동 시마다 갱신 (이미지 변경 반영 위해)

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
        <header className="top-header">
            {/* 1. 중앙: 글로벌 검색창 */}
            <div className="header-center">
                <div className="search-bar-wrapper">
                    <Icons.Search />
                    <input type="text" placeholder="이슈, 리포트, 멤버 검색..." />
                </div>
            </div>

            {/* 2. 우측: 유틸리티 버튼 */}
            {!isAuthPage && (
                <div className="header-right">
                    <div className="divider-vertical"></div>

                    <button className="icon-btn" title="알림">
                        <Icons.Bell />
                        <span className="noti-badge"></span>
                    </button>

                    <button className="icon-btn" title="도움말">
                        <Icons.Help />
                    </button>

                    <div className="header-profile" ref={profileRef}>
                        <img 
                            src={profileImg || "/img/Profile.svg"} 
                            alt="Profile"
                            className="mini-avatar" 
                            onClick={toggleProfile}
                            style={{
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: '1px solid #e5e7eb'
                            }}
                        />
                        {isProfileOpen && (
                            <Profile onClose={() => setIsProfileOpen(false)} />
                        )}
                    </div>
                </div>
            )}
            {/*<div className="header-right">*/}

            {/*    <div className="divider-vertical"></div>*/}

            {/*    /!* 알림 *!/*/}
            {/*    <button className="icon-btn" title="알림">*/}
            {/*        <Icons.Bell />*/}
            {/*        <span className="noti-badge"></span>*/}
            {/*    </button>*/}
            {/*    */}
            {/*    <button className="icon-btn" title="도움말">*/}
            {/*        <Icons.Help />*/}
            {/*    </button>*/}

            {/*    /!* 프로필 *!/*/}
            {/*    <div className="header-profile">*/}
            {/*        <div className="mini-avatar"*/}
            {/*        onClick={toggleProfile}*/}
            {/*        >홍</div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </header>

//     {!isAuthPage && (
//         <div className="header-right">
//             <div className="icon-group">
//                 <div className="icon-circle" style={{position: 'relative'}} ref={profileRef}>
//                     <img
//                         src="/img/Profile.svg"
//                         alt="profile icon"
//                         className="profile"
//                         onClick={toggleProfile}
//                         style={{ width: 25 }}
//                     />
//
//                     {isProfileOpen && (<Profile onClose={()=>setIsProfileOpen(false)}/>)}
//                 </div>
//             </div>
//         </div>
//     )}
// </header>
//
//     <main>
//         <Outlet />
//     </main>
// </>
    );
}