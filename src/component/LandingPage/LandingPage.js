import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as SiteLogo } from '../../layout/Site_logo.svg';
import { motion } from 'framer-motion'; // 애니메이션 라이브러리
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    // 애니메이션 설정값 (Fade Up)
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    return (
        <div className="landing-container">
            {/* 1. 네비게이션 바 */}
            <nav className="landing-nav">
                <div className="landing-logo">
                    <SiteLogo width="32" height="32" className="logo-svg" />
                </div>
                <div className="nav-buttons">
                    <button className="btn-ghost" onClick={() => navigate('/login')}>로그인</button>
                    <button className="btn-primary" onClick={() => navigate('/signup')}>무료로 시작하기</button>
                </div>
            </nav>

            {/* 2. 히어로 섹션 (메인 타이틀) */}
            <header className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">
                        개발자를 위한<br />
                        <span className="text-gradient">가장 완벽한 AI 파트너</span>
                    </h1>
                    <p className="hero-subtitle">
                        프로젝트 관리, GitHub 연동, 그리고 AI 자동 리포트까지.<br />
                        LinkLogMate와 함께 개발에만 집중하세요. 나머지는 우리가 처리할게요.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-large" onClick={() => navigate('/signup')}>지금 시작하기</button>
                        <button className="btn-outline" onClick={() => navigate('/login')}>대시보드 체험하기</button>
                    </div>
                </motion.div>

                {/* 배경 장식 요소 (동적 원) */}
                <div className="hero-bg-circle circle-1"></div>
                <div className="hero-bg-circle circle-2"></div>
            </header>

            {/* 3. 핵심 기능 소개 (스크롤 애니메이션) */}
            <section className="features-section">

                <motion.div className="feature-row" {...fadeInUp}>
                    <div className="feature-text">
                        <span className="feature-label">SMART TASK MANAGEMENT</span>
                        <h2>빈틈없는 업무 관리,<br />성공적인 프로젝트의 시작.</h2>
                        <p>
                            팀원들에게 업무를 할당하고 우선순위와 마감일을 설정하세요.
                            진행 상황을 실시간으로 파악하고, 놓치는 일정 없이 프로젝트를 완주할 수 있습니다.
                        </p>
                    </div>
                    <div className="feature-card card-task">
                        {/* Task List Mock UI */}
                        <div className="task-mock-ui">
                            <div className="task-mock-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <div className="task-list-item">
                                <div className="checkbox checked"></div>
                                <div className="task-content">
                                    <div className="task-line title done">로그인 API 연동</div>
                                    <div className="task-line sub">Backend Team • Today</div>
                                </div>
                                <div className="badge done">Done</div>
                            </div>
                            <div className="task-list-item">
                                <div className="checkbox"></div>
                                <div className="task-content">
                                    <div className="task-line title">메인 대시보드 UI 기획</div>
                                    <div className="task-line sub">Design Team • D-2</div>
                                </div>
                                <div className="badge progress">In Progress</div>
                            </div>
                            <div className="task-list-item">
                                <div className="checkbox"></div>
                                <div className="task-content">
                                    <div className="task-line title">DB 스키마 설계</div>
                                    <div className="task-line sub">Backend Team • D-5</div>
                                </div>
                                <div className="badge todo">To Do</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 2: 작업 관리 */}
                <motion.div className="feature-row" {...fadeInUp}>
                    <div className="feature-text">
                        <span className="feature-label">Drag & Drop</span>
                        <h2>직관적인 업무 관리,<br />물 흐르듯 유연하게.</h2>
                        <p>
                            간편하게 업무와 이슈를 관리하세요.
                            드래그 앤 드롭으로 상태를 변경하고, 태그와 담당자를 지정해 효율을 극대화합니다.
                        </p>
                    </div>
                    <div className="feature-card card-issue">
                        {/* [변경] Visual Kanban Board Mock */}
                        <div className="kanban-board-mock">
                            {/* Column 1: Todo */}
                            <div className="kanban-col">
                                <div className="col-header">To Do <span className="count">2</span></div>
                                <div className="kanban-card">
                                    <div className="card-tag bug">Bug</div>
                                    <div className="card-title">로그인 오류 수정</div>
                                    <div className="card-footer">
                                        <div className="avatar">K</div>
                                        <div className="priority high">⬆</div>
                                    </div>
                                </div>
                                <div className="kanban-card">
                                    <div className="card-tag feature">Feature</div>
                                    <div className="card-title">회원가입 폼 개선</div>
                                    <div className="card-footer">
                                        <div className="avatar">L</div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: In Progress (Active) */}
                            <div className="kanban-col active-col">
                                <div className="col-header">In Progress <span className="count">1</span></div>
                                <div className="kanban-card active-card">
                                    <div className="card-tag design">Design</div>
                                    <div className="card-title">메인 페이지 시안</div>
                                    <div className="card-footer">
                                        <div className="avatar">J</div>
                                        <div className="priority medium">-</div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Done */}
                            <div className="kanban-col">
                                <div className="col-header">Done <span className="count">5</span></div>
                                <div className="kanban-card done-card">
                                    <div className="card-tag feature">Feature</div>
                                    <div className="card-title">초기 세팅 완료</div>
                                    <div className="card-footer">
                                        <div className="avatar">A</div>
                                        <div className="check-icon">✔</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* [수정됨] Feature 2: 이슈 & 깃허브 추적 */}
                <motion.div className="feature-row" {...fadeInUp}>
                    <div className="feature-text">
                        <span className="feature-label">ISSUE & CODE TRACE</span>
                        <h2>이슈와 커밋의<br />완벽한 연결고리.</h2>
                        <p>
                            단순한 할 일 관리가 아닙니다. 이슈 해결을 위해 생성된 브랜치와 커밋을 자동으로 연결합니다.
                            어떤 코드가 문제를 일으켰고, 어떻게 수정되었는지 한눈에 파악하세요.
                        </p>
                    </div>
                    <div className="feature-card card-issue">
                        {/* 이슈-브랜치-커밋 연결 흐름 Mock UI */}
                        <div className="issue-git-flow">

                            {/* 1. 이슈 카드 */}
                            <div className="flow-card issue-node">
                                <div className="flow-header">
                                    <span className="flow-id">#402</span>
                                    <span className="card-tag bug">Bug</span>
                                </div>
                                <div className="flow-title">로그인 API 500 에러</div>
                                <div className="flow-footer">
                                    <div className="avatar">D</div>
                                    <span className="status-text">In Progress</span>
                                </div>
                            </div>

                            {/* 2. 연결선 (애니메이션 효과 가능) */}
                            <div className="flow-connector">
                                <span className="connector-line"></span>
                                <div className="connector-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 3v12"></path><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                                    Linked
                                </div>
                            </div>

                            {/* 3. 깃허브 브랜치 & 커밋 */}
                            <div className="git-tree-node">
                                <div className="branch-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                                    fix/login-error
                                </div>
                                <div className="commit-list">
                                    <div className="commit-item">
                                        <div className="commit-dot"></div>
                                        <div className="commit-info">
                                            <span className="commit-hash">a1b2c3</span>
                                            <span className="commit-msg">Fix NPE in Auth</span>
                                        </div>
                                    </div>
                                    <div className="commit-item">
                                        <div className="commit-dot"></div>
                                        <div className="commit-info">
                                            <span className="commit-hash">d4e5f6</span>
                                            <span className="commit-msg">Add Error Log</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Feature 1: AI 리포트 */}
                <motion.div className="feature-row" {...fadeInUp}>
                    <div className="feature-text">
                        <span className="feature-label">AI INTELLIGENCE</span>
                        <h2>매일 쓰는 리포트,<br />AI가 자동으로.</h2>
                        <p>
                            오늘 한 업무와 커밋 기록을 바탕으로 AI가 자동으로 데일리 리포트를 작성해줍니다.
                            번거로운 문서 작업에서 해방되세요.
                        </p>
                    </div>
                    <div className="feature-card card-ai">
                        <div className="mock-ui">
                            <div className="mock-header">Daily Report.ai</div>
                            <div className="mock-body">
                                <div className="report-content">
                                    <h4 className="report-title">📅 Today's Summary</h4>
                                    <ul className="report-list">
                                        <li>✅ <strong>Login API</strong> 구현 완료</li>
                                        <li>🔧 Auth 미들웨어 <strong>NullPointer 오류</strong> 수정</li>
                                        <li>🚀 <strong>Dev 서버</strong> 배포 및 테스트</li>
                                    </ul>
                                </div>
                                <div className="ai-badge">✨ AI Generated</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 3: GitHub 연동 */}
                <motion.div className="feature-row" {...fadeInUp}>
                    <div className="feature-text">
                        <span className="feature-label">GITHUB INTEGRATION</span>
                        <h2>코드와 프로젝트의<br />완벽한 동기화.</h2>
                        <p>
                            GitHub 저장소를 연결하면 커밋, PR, 이슈가 자동으로 연동됩니다.
                            IDE를 벗어나지 않아도 프로젝트의 흐름을 놓치지 않습니다.
                        </p>
                    </div>
                    <div className="feature-card card-github">
                        <div className="github-icon-large">
                            <svg viewBox="0 0 24 24" fill="white" width="80" height="80"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 4. 하단 CTA */}
            <section className="cta-section">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="cta-box"
                >
                    <h2>팀의 생산성을 200% 끌어올릴 준비 되셨나요?</h2>
                    <p>지금 바로 LinkLogMate와 함께 스마트한 협업을 시작하세요.</p>
                    <button className="btn-white" onClick={() => navigate('/signup')}>무료로 시작하기</button>
                </motion.div>
            </section>

            {/* 5. 푸터 */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div>© 2026 LinkLogMate. All rights reserved.</div>
                    <div className="footer-links">
                        <span>개인정보처리방침</span>
                        <span>이용약관</span>
                        <span>문의하기</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;