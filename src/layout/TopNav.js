import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import Profile from '../component/modal/Profile';
import AlarmModal from '../component/modal/AlarmModal';
import "./TopNav.css";
import { api } from "../utils/api";
import ToastNotification from "../component/toast/ToastNotification";
import { EventSourcePolyfill } from 'event-source-polyfill';



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
    const [isAlarmOpen, setIsAlarmOpen] = useState(false)
    const [profileImg, setProfileImg] = useState(null);

    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    
    const profileRef = useRef(null);
    const alarmRef = useRef(null);

    //  로그인 또는 회원가입 페이지인지 확인하는 변수
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const toggleAlarm = () => {
        setIsAlarmOpen(!isAlarmOpen);
    }

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((alarmData) => {
        const newToast = {
            id: Date.now(), // 고유 ID 생성 (타임스탬프)
            ...alarmData
        };
        setToasts((prev) => [...prev, newToast]); 
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await api.get("/api/alarms/unread");
            setUnreadCount(count);
        } catch (error) {
            console.error("알림 개수 로드 실패", error);
        }
    }, []);

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
            fetchUnreadCount();
        }
    }, [isAuthPage, location.pathname, fetchUnreadCount]); // 페이지 이동 시마다 갱신 (이미지 변경 반영 위해)

    // 외부 클릭 감지 로직 추가
    useEffect(() => {
        const handleClickOutside = (event) => {
            // profileRef가 현재 존재하고, 클릭한 대상(event.target)이 profileRef 내부가 아니라면
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false); // 모달 닫기
            }
            if(alarmRef.current && !alarmRef.current.contains(event.target)){
                setIsAlarmOpen(false);
            }
        };

        // 문서 전체에 클릭 이벤트 리스너 추가
        document.addEventListener('mousedown', handleClickOutside);

        // 컴포넌트가 언마운트될 때 리스너 제거 (메모리 누수 방지)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // SSE 연결
    useEffect(() => {
        if (isAuthPage) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const eventSource = new EventSourcePolyfill('http://localhost:8080/api/alarms/subscribe', {
            headers: { Authorization: `Bearer ${token}` },
            heartbeatTimeout: 86400000,
        });

        eventSource.onopen = () => console.log("SSE Connected!");

        eventSource.addEventListener('alarm', (e) => {
            const newAlarm = JSON.parse(e.data);
            console.log("새 알림 도착:", newAlarm);

            setUnreadCount(prev => prev + 1);
            
            // [수정] 토스트 배열에 추가
            addToast(newAlarm);
        });

        eventSource.onerror = (e) => {
            console.error("SSE Error:", e);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            console.log("SSE Disconnected");
        };
    }, [isAuthPage, addToast]); // addToast 의존성 추가

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

                    {/* [변경] 알림 버튼 Wrapper */}
                    <div className="header-alarm-wrapper" ref={alarmRef} style={{position: 'relative'}}>
                        <button className="icon-btn" title="알림" onClick={toggleAlarm}>
                            <Icons.Bell />
                            {unreadCount > 0 && (
                                <span className="noti-badge"> {/* CSS 공유를 위해 유지 가능 */}
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {/* [변경] 컴포넌트 교체 */}
                        {isAlarmOpen && (
                            <AlarmModal 
                                onClose={() => setIsAlarmOpen(false)} 
                                onUpdate={fetchUnreadCount} 
                            />
                        )}
                    </div>

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

            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column-reverse', // 최신 알림이 아래쪽(또는 위쪽)에 오도록 조정 가능 (현재는 위로 쌓임)
                gap: '10px',
                pointerEvents: 'none' // 빈 영역 클릭 시 뒤쪽 요소 클릭 가능하게
            }}>
                {createPortal(
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column-reverse', // 최신 알림이 밑에서부터 위로 쌓임 (요청하신 사항)
                        gap: '10px',
                        pointerEvents: 'none' // 알림 사이의 빈 공간은 클릭 통과되도록 설정
                    }}>
                        {toasts.map((toast) => (
                            // 개별 알림은 클릭 이벤트를 받아야 하므로 pointerEvents: auto 설정
                            <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                                <ToastNotification 
                                    id={toast.id}
                                    alarm={toast} 
                                    onClose={removeToast} 
                                />
                            </div>
                        ))}
                    </div>,
                    document.body // document.body에 직접 렌더링
                )}
            </div>
        </header>

    );
}