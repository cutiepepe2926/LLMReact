import './InviteSelectModal.css';

const InviteSelectModal = ({ projectName, onAccept, onDecline }) => {
    return (
        <div className="invite-modal-overlay">
            <div className="invite-modal-card">
                <div className="invite-icon">📩</div>
                <h3>프로젝트 초대</h3>
                <p>
                    <strong>'{projectName}'</strong> 프로젝트에 초대되었습니다.<br />
                    참여하시겠습니까?
                </p>
                <div className="invite-btn-group">
                    <button className="invite-btn decline" onClick={onDecline}>
                        거절
                    </button>
                    <button className="invite-btn accept" onClick={onAccept}>
                        수락
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteSelectModal;