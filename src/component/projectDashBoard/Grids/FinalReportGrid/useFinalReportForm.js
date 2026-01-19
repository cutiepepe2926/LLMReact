import React from "react";

export default function useFinalReportForm() {
    // 프로젝트명
    const [projectName, setProjectName] = React.useState("");

    // 옵션
    const TEMPLATE_OPTIONS = ["기본(프로젝트 보고서)", "포트폴리오 형식", "기술문서 형식"];
    const SECTION_OPTIONS = ["개요/초록", "역할/협업", "아키텍처", "API명세", "트러블슈팅", "기능 목록", "결과/회고", "개선점"];
    const SOURCE_OPTIONS = ["Git 로그", "일일 회고/요약본", "이슈", "PR"];

    // 선택값
    const [template, setTemplate] = React.useState(TEMPLATE_OPTIONS[0]); // 단일
    const [sections, setSections] = React.useState([]);                 // 다중
    const [sources, setSources] = React.useState([]);                   // 다중

    // 모달 상태
    const [modal, setModal] = React.useState({
        open: false,
        kind: "",       // "template" | "sections" | "sources"
        title: "",
        mode: "single", // "single" | "multi"
        options: [],
    });

    const openTemplate = () =>
        setModal({
            open: true,
            kind: "template",
            title: "템플릿 선택",
            mode: "single",
            options: TEMPLATE_OPTIONS,
        });

    const openSections = () =>
        setModal({
            open: true,
            kind: "sections",
            title: "포함할 섹션 선택",
            mode: "multi",
            options: SECTION_OPTIONS,
        });

    const openSources = () =>
        setModal({
            open: true,
            kind: "sources",
            title: "근거 소스 선택",
            mode: "multi",
            options: SOURCE_OPTIONS,
        });

    const closeModal = () => setModal((m) => ({ ...m, open: false }));

    const value =
        modal.kind === "template" ? template : modal.kind === "sections" ? sections : sources;

    const setValue = (next) => {
        if (modal.kind === "template") setTemplate(next);
        if (modal.kind === "sections") setSections(next);
        if (modal.kind === "sources") setSources(next);
    };

    const summary = (arr) => (arr.length === 0 ? "선택" : `${arr.length}개 선택`);

    return {
        // input
        projectName,
        setProjectName,

        // selected
        template,
        sections,
        sources,

        // open modal
        openTemplate,
        openSections,
        openSources,

        // modal props
        modal,
        value,
        setValue,
        closeModal,

        // helpers
        summary,
    };
}
