import { useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ id, alarm, onClose }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id); // 자신의 ID를 전달하여 삭제 요청
        }, 5000); 

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div className="toast-container">
            <div className="toast-icon-area">
                <div className="toast-icon">🔔</div>
            </div>
            <div className="toast-content">
                <h4 className="toast-title">새로운 알림</h4>
                <p className="toast-message">{alarm.content}</p>
                <span className="toast-time">방금 전</span>
            </div>
            <button className="toast-close" onClick={() => onClose(id)}>&times;</button>
        </div>
    );
};

export default ToastNotification;