import React from 'react';
import './TaskBoard.css';

const TaskCard = ({ task, onClick, onDragStart }) => {
    
    const getPriorityInfo = (p) => {
        const priorityNum = parseInt(p);
        switch(priorityNum) {
            case 3: return { text: "상", class: "high" };
            case 2: return { text: "중", class: "medium" };
            case 1: return { text: "하", class: "low" };
            default: return { text: "미설정", class: "none" };
        }
    };

    const priority = getPriorityInfo(task.priority);

    const renderAssignees = () => {
        if (!task.assignees || task.assignees.length === 0) return "미지정";
        if (task.assignees.length === 1) return task.assignees[0];
        return `${task.assignees[0]} 외 ${task.assignees.length - 1}명`;
    };

    return (
        <div className="task-card" onClick={() => onClick(task)} draggable onDragStart={onDragStart}>
            <div className="task-header">
                <span className="task-title">{task.title}</span>
                {task.dDay && <span className="d-day-badge">{task.dDay}</span>}
            </div>

            <div className="task-meta">
                <div className="assignee-group">
                    <span className="assignee-label">담당자:</span>
                    <span className="assignee-name">{renderAssignees()}</span>
                </div>
                <div className={`priority-tag ${priority.class}`}>
                    {priority.text}
                </div>
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