import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"; // 변경됨
import { api } from "../../../../../../../utils/api"; // 경로 확인 필요
import "./IssueChatModal.css";

export default function IssueChatModal({ open, onClose, issue, projectId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const endRef = useRef(null);
    const clientRef = useRef(null); // Stomp Client 객체

    // 1. 초기화 및 소켓 연결
    useEffect(() => {
        if (!open || !issue) return;

        const targetIssueId = issue.issueId || issue.id;

        // (1) 과거 채팅 내역 불러오기 (HTTP)
        api.get(`/api/projects/${projectId}/issues/${targetIssueId}/chats`)
            .then((response) => {
                setMessages(response || []);
            })
            .catch((err) => console.error("채팅 내역 로드 실패:", err));

        // (2) 소켓 클라이언트 생성 (New Way)
        const client = new Client({
            // SockJS 연결 함수를 factory로 제공
            webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),

            connectHeaders: {
                // localStorage 등에 저장된 토큰을 가져와야 함 (예시 코드)
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                projectId: projectId,
            },

            // 연결 성공 시 실행될 콜백
            onConnect: () => {
                // 구독 (Subscribe)
                client.subscribe(`/sub/issue/${targetIssueId}`, (msg) => {
                    if (msg.body) {
                        const newChat = JSON.parse(msg.body);
                        setMessages((prev) => [...prev, newChat]);
                    }
                });
            },

            // 에러 로깅 (선택)
            // debug: (str) => console.log(str),

            // 자동 재연결 설정 (0이면 비활성)
            reconnectDelay: 5000,
        });

        // 클라이언트 활성화
        client.activate();
        clientRef.current = client;

        // (3) 정리 (Unmount)
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate(); // disconnect 대신 deactivate 사용
            }
        };
    }, [open, issue, projectId]);

    // 2. 스크롤 자동 이동
    useEffect(() => {
        if (open) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    if (!open) return null;

    // 3. 메시지 전송 핸들러
    const send = () => {
        const trimmed = text.trim();
        // 연결이 안 됐거나(connected 확인) 내용이 없으면 중단
        if (!trimmed || !clientRef.current || !clientRef.current.connected) return;

        const targetIssueId = issue.issueId || issue.id;

        const chatMessage = {
            issueId: targetIssueId,
            projectId: projectId,
            userId: currentUserId,
            content: trimmed,
        };

        // (변경됨) send -> publish 사용
        clientRef.current.publish({
            destination: `/pub/issue/chat/${targetIssueId}`,
            body: JSON.stringify(chatMessage),
        });

        setText("");
    };

    // 날짜 포맷팅
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            className="issue-chat-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="issue-chat-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="issue-chat-head">
                    <div className="issue-chat-title">
                        이슈 채팅 <span className="issue-chat-sub"></span>
                    </div>
                    <button type="button" className="issue-chat-x" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="issue-chat-body">
                    {messages.map((m, index) => {
                        const isMe = m.userId === currentUserId;
                        return (
                            <div
                                key={m.chatId || index}
                                className={`chat-row ${isMe ? "me" : "other"}`}
                            >
                                {!isMe && <div className="chat-name">{m.senderName || m.userId}</div>}
                                <div className="chat-bubble">
                                    <div className="chat-text">{m.content}</div>
                                    <div className="chat-time">{formatTime(m.createdAt)}</div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                </div>

                <div className="issue-chat-input">
                    <input
                        className="chat-input"
                        value={text}
                        placeholder="메시지 입력..."
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                if (e.nativeEvent.isComposing) return;
                                e.preventDefault();
                                send();
                            }
                        }}
                    />
                    <button type="button" className="chat-send" onClick={send}>
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}