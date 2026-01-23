import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TaskCard from './TaskCard';
import TaskCreateModal from './modal/TaskCreateModal';
import TaskDetailPage from './TaskDetailPage';
import './TaskBoard.css';

const MOCK_TASKS = [
    { id: 1, status: 'TODO', title: '깃 연동 테스트', assignees: ['홍길동'], priority: '상', dDay: 'D-3', branch: 'feature/git-init' },
    { id: 2, status: 'IN_PROGRESS', title: '리포트 화면 구현', assignees: ['김철수', '홍길동'], priority: '중', dDay: '오늘 마감', branch: 'feature/report-ui' },
    { id: 3, status: 'DONE', title: '헤더 디자인 수정', assignees: ['홍길동'], priority: '하', dDay: '', branch: 'fix/header-css' },
    { id: 4, status: 'TODO', title: 'DB 스키마 설계', assignees: ['이영희'], priority: '상', dDay: 'D-5', branch: 'schema/init' },
];

function TaskBoard() {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null); 
    const [editingTask, setEditingTask] = useState(null);

    const isAdmin = true; 
    const currentUser = '홍길동';

    // --- [DnD 핸들러] ---
    // 드래그 시작 시 ID 저장
    const onDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    // 드롭 허용 (필수)
    const onDragOver = (e) => {
        e.preventDefault();
    };

    // 드롭 시 상태 변경
    const onDrop = (e, newStatus) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        handleStatusChange(taskId, newStatus);
    };

    // --- [기존 핸들러] ---
    const openCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData) => {
        if (editingTask) {
            const updatedTask = { ...editingTask, ...taskData };
            setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
            setSelectedTask(updatedTask);
        } else {
            const newTask = {
                id: Date.now(), // ID 생성 방식 변경 (충돌 방지)
                status: 'TODO',
                dDay: 'D-New',
                ...taskData
            };
            setTasks([...tasks, newTask]);
        }
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleDeleteTask = (taskId) => {
        if (window.confirm("정말 이 업무를 삭제하시겠습니까?")) {
            setTasks(tasks.filter(t => t.id !== taskId));
            setSelectedTask(null);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleBackToList = () => {
        setSelectedTask(null);
    };

    const getTasksByStatus = (status) => {
        const filtered = filterType === 'MY' 
            ? tasks.filter(t => t.assignees.includes(currentUser)) 
            : tasks;
        return filtered.filter(t => t.status === status);
    };

    // 상태 변경 (DnD 및 상세페이지 공용)
    const handleStatusChange = (taskId, newStatus) => {
        // (UI 업데이트) 
        const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // (상세 페이지 동기화)
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask({ ...selectedTask, status: newStatus });
        }

        /* ★ [API 연동 시 추가될 코드]
           API: PATCH api/projects/{projectId}/tasks/{taskId}/status
           body: { status: newStatus }
           
           axios.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status: newStatus });
        */
        console.log(`API 호출: Project ${projectId} / Task ${taskId} -> ${newStatus}`);
    };

    if (selectedTask) {
        return (
            <TaskDetailPage 
                task={selectedTask} 
                onBack={handleBackToList}
                onEdit={() => openEditModal(selectedTask)}
                onDelete={() => handleDeleteTask(selectedTask.id)} 
                onStatusChange={handleStatusChange} 
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
                    {isAdmin && (
                        <button className="btn-primary" onClick={openCreateModal}>+ 업무 추가</button>
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
                        onDragOver={onDragOver} // 드래그 허용
                        onDrop={(e) => onDrop(e, status)} // 드롭 시 상태 변경
                    >
                        <div className={`column-header ${status.toLowerCase().replace('_', '')}`}>
                            <div className="header-title"><span className="dot"></span> {status.replace('_', ' ')}</div>
                            <span className="count">{getTasksByStatus(status).length}</span>
                        </div>
                        <div className="column-body">
                            {getTasksByStatus(status).map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onClick={handleTaskClick} 
                                    // 드래그 이벤트 전달
                                    onDragStart={(e) => onDragStart(e, task.id)}
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