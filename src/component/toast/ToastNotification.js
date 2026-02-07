import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ToastNotification.css';

const ToastNotification = ({ id, alarm, onClose }) => {
    const navigate = useNavigate();
    const [timeAgo, setTimeAgo] = useState('방금 전');

    // 1. 날짜 파싱 함수
    const parseDate = (dateVal) => {
        if (!dateVal) return null;
        if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3], dateVal[4], dateVal[5]);
        }
        return new Date(dateVal);
    };

    // 2. 시간 계산 로직
    useEffect(() => {
        const updateTime = () => {
            const created = parseDate(alarm.createdAt);
            if (!created) {
                setTimeAgo('방금 전');
                return;
            }

            const now = new Date();
            const diff = (now - created) / 1000; // 초 단위 차이

            if (diff < 60) {
                setTimeAgo('방금 전');
            } else if (diff < 3600) {
                setTimeAgo(`${Math.floor(diff / 60)}분 전`);
            } else if (diff < 86400) {
                setTimeAgo(`${Math.floor(diff / 3600)}시간 전`);
            } else {
                setTimeAgo(`${Math.floor(diff / 86400)}일 전`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [alarm.createdAt]);

    // 3. 자동 닫기
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    // 4. 클릭 핸들러
    const handleClick = () => {
        console.log("알람 클릭됨! 데이터:", alarm); // [확인용 로그]

        if (alarm.type === 'PROJECT_DUE_SOON' ||
            alarm.type === 'PROJECT_FINISHED' ||
            alarm.type === 'PROJECT_HARD_DELETE_SOON' ||
            alarm.type === 'PROJECT_REACTIVATED' ||
            alarm.type === 'PROJECT_DELETED' ||
            alarm.type === 'PROJECT_RESTORED'

        ) {
            // 백엔드에서 준 URL 무시하고, 올바른 상세 페이지 경로로 이동
            navigate('/projectDetail', {
                state: {
                    projectData: {
                        projectId: alarm.projectId
                    }
                }
            });
            if (onClose) onClose();
            return;
        }

        if (alarm.type === 'PROJECT_PERMANENTLY_DELETED') {
            return;
        }

        if (alarm.type === 'ISSUE_ASSIGN' || alarm.type === 'ISSUE_UNASSIGN' || alarm.type === 'ISSUE_CHAT') {
            navigate(alarm.url);
            if (onClose) onClose();
            return; // 여기서 함수 종료
        }

        if (alarm.url && alarm.url.includes('invite')) {
            if (alarm.projectId) {
                navigate('/projectDetail', {
                    state: {
                        projectData: {
                            projectId: alarm.projectId
                        }
                    }
                });
                if (onClose) onClose();
                return; // 여기서 함수 종료
            }
        }

        if (alarm.url) {
            navigate('/projectDetail', {
                state: {
                    activeTab: 'task',
                    projectData: { projectId: alarm.projectId }, // 알림 객체에 포함된 projectId
                    targetTaskId: alarm.referenceId // 알림 객체의 참조 ID (TaskId)
                }
            });
            onClose(id);
        } else {
            console.warn("이동할 URL이 없습니다. (DB 매핑 확인 필요)");
        }
    };

    return (
        <div className="toast-container" onClick={handleClick} style={{ cursor: 'pointer' }}>
            <div className="toast-icon-area">
                <div className="toast-icon">🔔</div>
            </div>
            <div className="toast-content">
                <h4 className="toast-title">새로운 알림</h4>
                <p className="toast-message">{alarm.content}</p>
                <span className="toast-time">{timeAgo}</span>
            </div>
            <button 
                className="toast-close" 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onClose(id); 
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default ToastNotification;