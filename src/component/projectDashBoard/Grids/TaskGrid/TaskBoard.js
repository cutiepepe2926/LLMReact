import React, { useState } from 'react';
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
    // --- 상태 관리 ---
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    
    // 선택된 업무 (상세 페이지용)
    const [selectedTask, setSelectedTask] = useState(null); 
    // 수정할 업무 (모달용) - null이면 생성 모드, 값이 있으면 수정 모드
    const [editingTask, setEditingTask] = useState(null);

    const isAdmin = true; 
    const currentUser = '홍길동'; // 현재 로그인한 사용자 (테스트용)

    // --- 핸들러 ---

    // 1. 모달 열기 (생성 모드)
    const openCreateModal = () => {
        setEditingTask(null); // 수정 모드 해제
        setIsModalOpen(true);
    };

    // 2. 모달 열기 (수정 모드) - 상세 페이지에서 호출
    const openEditModal = (task) => {
        setEditingTask(task); // 수정할 데이터 세팅
        setIsModalOpen(true);
    };

    // 3. 업무 저장 (생성 또는 수정)
    const handleSaveTask = (taskData) => {
        if (editingTask) {
            const updatedTask = { ...editingTask, ...taskData };
            setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
            setSelectedTask(updatedTask); //
        } else {
            // [생성 로직]
            const newTask = {
                id: tasks.length + 1,
                status: 'TODO',
                dDay: 'D-New',
                ...taskData
            };
            setTasks([...tasks, newTask]);
        }
        setIsModalOpen(false);
        setEditingTask(null);
    };

    // 4. 업무 삭제
    const handleDeleteTask = (taskId) => {
        if (window.confirm("정말 이 업무를 삭제하시겠습니까?")) {
            setTasks(tasks.filter(t => t.id !== taskId));
            setSelectedTask(null); // 상세 페이지 닫기
        }
    };

    // 카드 클릭 -> 상세 페이지 이동
    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    // 뒤로가기
    const handleBackToList = () => {
        setSelectedTask(null);
    };

    // 필터링
    const getTasksByStatus = (status) => {
        const filtered = filterType === 'MY' 
            ? tasks.filter(t => t.assignees.includes(currentUser)) 
            : tasks;
        return filtered.filter(t => t.status === status);
    };

    // 상태 변경 핸들러
    const handleStatusChange = (targetTask, newStatus) => {
        // 1. 전체 목록(tasks) 업데이트
        const updatedTasks = tasks.map(t => 
            t.id === targetTask.id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // 2. 현재 보고 있는 상세 페이지(selectedTask) 데이터도 동기화
        if (selectedTask && selectedTask.id === targetTask.id) {
            setSelectedTask({ ...selectedTask, status: newStatus });
        }
    };

    // [상세 페이지]
    if (selectedTask) {
        return (
            <TaskDetailPage 
                task={selectedTask} 
                onBack={handleBackToList}
                onEdit={() => openEditModal(selectedTask)} // 수정 버튼 연결
                onDelete={() => handleDeleteTask(selectedTask.id)} // 삭제 버튼 연결
                onStatusChange={handleStatusChange}
            />
        );
    }

    // [리스트 화면]
    return (
        <div className="task-board-container">
            {/* 업무 생성/수정 모달 */}
            {isModalOpen && (
                <TaskCreateModal 
                    initialData={editingTask} // 초기 데이터 전달 (수정 시)
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
                    <div className="kanban-column" key={status}>
                        <div className={`column-header ${status.toLowerCase().replace('_', '')}`}>
                            <div className="header-title"><span className="dot"></span> {status.replace('_', ' ')}</div>
                            <span className="count">{getTasksByStatus(status).length}</span>
                        </div>
                        <div className="column-body">
                            {getTasksByStatus(status).map(task => (
                                <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TaskBoard;