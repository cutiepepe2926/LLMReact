import React from 'react';
import './TaskBoard.css';

const TaskCard = ({ task, onClick, onDragStart }) => {
    
    const getPriorityColor = (p) => {
        if (p === '상') return 'badge-red';
        if (p === '중') return 'badge-yellow';
        return 'badge-gray';
    };

    const renderAssignees = () => {
        if (!task.assignees || task.assignees.length === 0) return "미지정";
        if (task.assignees.length === 1) return task.assignees[0];
        return `${task.assignees[0]} 외 ${task.assignees.length - 1}명`;
    };

    return (
        <div 
            className="task-card" 
            onClick={() => onClick(task)}
            draggable="true" // ★ 드래그 가능하게 설정
            onDragStart={onDragStart} // ★ 드래그 시작 이벤트 연결
        >
            <div className="task-header">
                <span className="task-title">{task.title}</span>
                {task.dDay && <span className="d-day-badge">{task.dDay}</span>}
            </div>

            <div className="task-meta">
                <div className="assignee-group">
                    <span className="assignee-label">담당자:</span>
                    <span className="assignee-name">{renderAssignees()}</span>
                </div>
                <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
            </div>

            <div className="task-footer">
                <div className="git-branch-info">
                    <span className="branch-label">Branch</span>
                    <span className="branch-name">{task.branch}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;