import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import './AlarmModal.css'; // CSS 파일명도 변경

const AlarmModal = ({ onClose, onUpdate }) => {
    const [alarms, setAlarms] = useState([]);
    const navigate = useNavigate();

    // 알림 목록 가져오기
    useEffect(() => {
        const fetchAlarms = async () => {
            try {
                const data = await api.get('/api/alarms');
                setAlarms(data);
            } catch (error) {
                console.error("알림 목록 로드 실패:", error);
            }
        };
        fetchAlarms();
    }, []);

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMS = now - date;
        const diffHours = diffMS / (1000 * 60 * 60);

        if (diffHours < 24) {
            const hours = Math.floor(diffHours);
            return `${hours} hours ago`; 
        } else {
            const yy = date.getFullYear().toString().slice(2);
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            return `${yy}.${mm}.${dd}`;
        }
    };

    // 단일 알림 읽음 처리 및 이동
    const handleItemClick = async (alarm) => {
        if (!alarm.isRead) {
            try {
                await api.put(`/api/alarms/${alarm.alarmId}/read`);
                setAlarms(prev => prev.map(a => 
                    a.alarmId === alarm.alarmId ? { ...a, isRead: true } : a
                ));
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error("알림 읽음 처리 실패:", error);
            }
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

        if (alarm.url && alarm.url.includes('task')) {
            navigate('/projectDetail', {
                state: {
                    activeTab: 'task',
                    projectData: { projectId: alarm.projectId }, // alarm에서 projectId 추출
                    targetTaskId: alarm.referenceId // 알림의 참조 ID를 태스크 ID로 사용
                }
            });
            if (onClose) onClose();
            return; // 여기서 함수 종료
        }

        // Case B: 'invite'가 포함되지 않은 일반 URL인 경우 -> 해당 URL로 바로 이동
        if (alarm.url) {
            navigate(alarm.url);
            if (onClose) onClose();
            return; // 여기서 함수 종료
        }

        // Case C: URL은 없지만 projectId만 있는 일반 알림인 경우 (기존 로직 보존)
        if (alarm.projectId) {
            navigate('/projectDetail', {
                state: {
                    projectData: {
                        projectId: alarm.projectId
                    }
                }
            });
            if (onClose) onClose();
        }
    };

    // 모두 읽음 처리
    const handleReadAll = async () => {
        try {
            await api.put('/api/alarms/read-all');
            setAlarms(prev => prev.map(a => ({ ...a, isRead: true })));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("모두 읽음 처리 실패:", error);
        }
    };

    const handleDeleteRead = async () => {
        try {
            await api.delete('/api/alarms/read');
            // 화면에서 읽은 알림만 제거
            setAlarms(prev => prev.filter(a => !a.isRead));
        } catch (error) {
            console.error("읽은 알림 삭제 실패:", error);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("정말 모든 알림을 삭제하시겠습니까?")) return;
        
        try {
            await api.delete('/api/alarms/all');
            setAlarms([]); // 빈 목록으로 초기화
            if (onUpdate) onUpdate(); // 뱃지 0으로 갱신
        } catch (error) {
            console.error("전체 삭제 실패:", error);
        }
    };

    return (
        <div className="alarm-modal-container"> {/* 클래스명 alarm으로 변경 */}
            <div className="alarm-header">
                <h3>알림</h3>
                <button className="read-all-btn" onClick={handleReadAll}>
                    모두 읽음
                </button>
            </div>

            <div className="alarm-list">
                {alarms.length === 0 ? (
                    <div className="empty-alarm">새로운 알림이 없습니다.</div>
                ) : (
                    alarms.map((alarm) => (
                        <div 
                            key={alarm.alarmId} 
                            className={`alarm-item ${alarm.isRead ? 'read' : 'unread'}`}
                            onClick={() => handleItemClick(alarm)}
                        >
                            <img 
                                src={alarm.senderFilePath || "/img/Profile.svg"} 
                                alt="Sender" 
                                className="alarm-avatar"
                            />
                            
                            <div className="alarm-content-wrapper">
                                <p className="alarm-text">{alarm.content}</p>
                                <span className="alarm-date">{formatDate(alarm.createdAt)}</span>
                            </div>
                            
                            {!alarm.isRead && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>

            <div className="alarm-footer">
                <button className="delete-btn" onClick={handleDeleteRead}>
                    읽은 알림 삭제
                </button>
                <div className="divider-vertical-small"></div>
                <button className="delete-btn" onClick={handleDeleteAll}>
                    모두 삭제
                </button>
            </div>
        </div>
    );
};

export default AlarmModal;