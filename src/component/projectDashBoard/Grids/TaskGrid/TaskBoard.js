import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskCard from './TaskCard';
import TaskCreateModal from './modal/TaskCreateModal';
import TaskDetailPage from './TaskDetailPage';
import { api } from '../../../../utils/api';
import './TaskBoard.css';

function TaskBoard({ projectId: propProjectId }) {
    const params = useParams();
    const projectId = propProjectId || params.projectId;

    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null); 
    const [editingTask, setEditingTask] = useState(null);

    const currentUser = localStorage.getItem("userId"); // 로그인한 유저 ID

    // 1. 업무 목록 불러오기
    const fetchTasks = async () => {
        if (!projectId) {
            console.error("projectId가 없습니다!");
            return;
        }

        try {
            console.log(`Fetching tasks for project: ${projectId}`); // [디버깅용 로그]
            const data = await api.get(`/api/projects/${projectId}/tasks`);
            
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                setTasks([]); 
            }
        } catch (error) {
            console.error("업무 목록 로딩 실패:", error);
            setTasks([]);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    // 2. 업무 생성/수정 저장
    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                // 수정 PUT
                await api.put(`/api/projects/${projectId}/tasks/${editingTask.taskId}`, taskData);
            } else {
                // 생성 POST
                await api.post(`/api/projects/${projectId}/tasks`, taskData);
            }
            setIsModalOpen(false);
            setEditingTask(null);
            fetchTasks(); // 목록 갱신
        } catch (error) {
            console.error("업무 저장 실패:", error);
            alert("업무 저장에 실패했습니다.");
        }
    };

    // 3. 드래그 앤 드롭 상태 변경
    const onDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };
    const onDragOver = (e) => e.preventDefault();
    
    const onDrop = async (e, newStatus) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        
        // 낙관적 업데이트 (UI 먼저 반영)
        setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));

        try {
            await api.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status: newStatus });
        } catch (error) {
            console.error("상태 변경 실패:", error);
            fetchTasks(); // 실패 시 롤백
        }
    };

    // 4. 필터링 로직
    const getTasksByStatus = (status) => {
        if (!Array.isArray(tasks)) return [];

        const filtered = filterType === 'MY' 
            ? tasks.filter(t => t.userId === currentUser || (t.assigneeIds && t.assigneeIds.includes(currentUser)))
            : tasks;
            
        // filtered가 배열인지 확인 후 filter 실행
        return Array.isArray(filtered) ? filtered.filter(t => t.status === status) : [];
    };

    // 5. 삭제 핸들러
    const handleDeleteTask = async (taskId) => {
        if(window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
                setSelectedTask(null);
                fetchTasks();
            } catch (error) {
                alert("삭제 실패");
            }
        }
    };

    // 상세 페이지 렌더링
    if (selectedTask) {
        return (
            <TaskDetailPage 
                projectId={projectId}
                task={selectedTask} 
                onBack={() => { setSelectedTask(null); fetchTasks(); }} // 뒤로가기 시 새로고침
                onEdit={() => { setEditingTask(selectedTask); setIsModalOpen(true); }}
                onDelete={() => handleDeleteTask(selectedTask.taskId)}
                // 상세 페이지 내부에서의 상태 변경 처리
                onStatusChange={async (taskId, status) => {
                    await api.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status });
                    fetchTasks();
                }}
            />
        );
    }

    return (
        <div className="task-board-container">
            {isModalOpen && (
                <TaskCreateModal 
                    initialData={editingTask}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTask}
                />
            )}

            <div className="board-controls">
                <h3 className="section-title">업무 현황</h3>
                <div className="control-buttons">
                    <button className="btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>+ 업무 추가</button>
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