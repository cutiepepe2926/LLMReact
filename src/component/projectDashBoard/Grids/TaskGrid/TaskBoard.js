import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskCreateModal from './modal/TaskCreateModal';
import TaskDetailPage from './TaskDetailPage';
import { api } from '../../../../utils/api';
import './TaskBoard.css';

function TaskBoard({ projectId, project, initialTaskId, clearTargetTaskId }) {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null); 
    const [editingTask, setEditingTask] = useState(null);
    const [myRole, setMyRole] = useState('MEMBER');

    const currentUser = localStorage.getItem("userId");
    const isAdminOrOwner = myRole === 'OWNER' || myRole === 'ADMIN';

    // 데이터 조회 (업무 목록 & 내 권한)
    useEffect(() => {
        if (!projectId) return;

        const fetchData = async () => {
            try {
                const taskRes = await api.get(`/api/projects/${projectId}/tasks`);
                setTasks(Array.isArray(taskRes) ? taskRes : []);

                const roleRes = await api.get(`/api/projects/${projectId}/tasks/my-role`);
                if (roleRes && roleRes.role) {
                    setMyRole(roleRes.role);
                }
            } catch (error) {
                console.error(error);
                setTasks([]);
            }
        };

        fetchData();
    }, [projectId]);

    // 알람 진입 처리
    useEffect(() => {
        if (initialTaskId && tasks.length > 0) {
            const targetId = parseInt(initialTaskId);
            const target = tasks.find(t => t.taskId === targetId);
            if (target) {
                setSelectedTask(target);
                if (clearTargetTaskId) clearTargetTaskId();
            }
        }
    }, [initialTaskId, tasks, clearTargetTaskId]);

    // 업무 생성 및 수정 저장
    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                await api.put(`/api/projects/${projectId}/tasks/${editingTask.taskId}`, taskData);
            } else {
                await api.post(`/api/projects/${projectId}/tasks`, taskData);
            }
            window.dispatchEvent(new CustomEvent('taskUpdate'));
            setIsModalOpen(false);
            setEditingTask(null);
            
            const data = await api.get(`/api/projects/${projectId}/tasks`);
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            alert("저장 실패");
        }
    };

    // 드래그 앤 드롭
    const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
    const onDragOver = (e) => e.preventDefault();
    
    const onDrop = async (e, newStatus) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        const targetTask = tasks.find(t => t.taskId === taskId);
        const isAssignee = targetTask?.assigneeIds?.includes(currentUser);

        if (!isAdminOrOwner && !isAssignee) {
            alert("권한이 없습니다.");
            return;
        }

        setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));

        try {
            await api.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status: newStatus });
            window.dispatchEvent(new CustomEvent('taskUpdate'));
        } catch (error) {
            const data = await api.get(`/api/projects/${projectId}/tasks`);
            setTasks(Array.isArray(data) ? data : []);
        }
    };

    // 필터링
    const getTasksByStatus = (status) => {
        if (!Array.isArray(tasks)) return [];
        const filtered = filterType === 'MY' 
            ? tasks.filter(t => t.userId === currentUser || (t.assigneeIds && t.assigneeIds.includes(currentUser)))
            : tasks;
        return filtered.filter(t => t.status === status);
    };

    // 삭제
    const handleDeleteTask = async (taskId) => {
        if(window.confirm("삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
                window.dispatchEvent(new CustomEvent('taskUpdate'));
                setSelectedTask(null);
                
                const data = await api.get(`/api/projects/${projectId}/tasks`);
                setTasks(Array.isArray(data) ? data : []);
            } catch (error) {
                alert("삭제 실패");
            }
        }
    };

    if (selectedTask) {
        return (
            <TaskDetailPage 
                projectId={projectId}
                task={selectedTask} 
                myRole={myRole}
                onBack={() => setSelectedTask(null)}
                onEdit={() => { 
                    setEditingTask(selectedTask); 
                    setSelectedTask(null); 
                    setIsModalOpen(true); 
                }}
                onDelete={() => handleDeleteTask(selectedTask.taskId)}
                onStatusChange={async (taskId, status) => {
                    await api.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status });
                    const data = await api.get(`/api/projects/${projectId}/tasks`);
                    setTasks(Array.isArray(data) ? data : []);
                }}
            />
        );
    }

    return (
        <div className="task-board-container">
            {isModalOpen && (
                <TaskCreateModal 
                    projectId={projectId}
                    initialData={editingTask}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTask}
                />
            )}

            <div className="board-controls">
                <h3 className="section-title">업무 현황</h3>
                <div className="control-buttons">
                    {isAdminOrOwner && (
                        <button className="btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                            + 업무 추가
                        </button>
                    )}
                    
                    <button 
                        className={`btn-filter ${filterType === 'MY' ? 'active' : ''}`}
                        onClick={() => setFilterType(filterType === 'ALL' ? 'MY' : 'ALL')}
                    >
                        {filterType === 'MY' ? '전체 보기' : '내 업무만 보기'}
                    </button>
                </div>
            </div>

            <div className="kanban-wrapper">
                {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                    <div 
                        className="kanban-column" 
                        key={status}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, status)}
                    >
                        <div className={`column-header ${status.toLowerCase().replace('_', '')}`}>
                            <div className="header-title">
                                <span className="dot"></span> {status.replace('_', ' ')}
                            </div>
                            <span className="count">{getTasksByStatus(status).length}</span>
                        </div>
                        <div className="column-body">
                            {getTasksByStatus(status).map(task => (
                                <TaskCard 
                                    key={task.taskId} 
                                    task={task} 
                                    onClick={() => setSelectedTask(task)} 
                                    onDragStart={(e) => onDragStart(e, task.taskId)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TaskBoard;