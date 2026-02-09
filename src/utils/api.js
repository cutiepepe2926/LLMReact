const BASE_URL = "";

/**
 * Fetch Wrapper 함수
 * @param {string} endpoint - API 엔드포인트 (예: "/users")
 * @param {object} options - fetch 옵션 (method, body, params 등)
*/

const request = async (endpoint, options = {}) => {
  // 1. URL 조합
  let url = `${BASE_URL}${endpoint}`;

  // 2. Query Parmaeters 처리 (예: ?page1&limit=10)
  if(options.params){
    const queryParams = new URLSearchParams(options.params).toString();
    url += `?${queryParams}`;
  }

  // 3. 헤더 설정
  const headers = {
    // "Content-Type" : "application/json",
    ...options.headers, // 사용자가 추가한 헤더가 있다면 덮어씌움
  };

  if(!(options.body instanceof FormData)){
    headers["Content-Type"] = "application/json";
  }

  // 4.JWT 토큰 자동 주입
  const token = localStorage.getItem("accessToken");
  if(token){
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 5. 요청 설정 구성
  const config = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  // Body가 객체이면서 "FormData가 아닐 때만" JSON 문자열로 변환
  if(config.body && typeof config.body === "object" && !(config.body instanceof FormData)){
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
      const refreshToken = localStorage.getItem("refreshToken");
      console.log("리프레시 토큰: ", refreshToken);
      

      // 리프레시 토큰이 있고, 현재 요청이 '재발급 요청' 자체가 아닐 때만 실행
      if (refreshToken && !endpoint.includes("/api/auth/reissue")) {
        try {
          console.log("Access Token 만료됨. 재발급 시도...");
          
          // 1. 토큰 재발급 요청
          const refreshResponse = await fetch(`${BASE_URL}/api/auth/reissue`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            
            // 2. 새로운 토큰 저장 (백엔드 응답 필드명에 맞춰 수정 필요, 예: accessToken)
            localStorage.setItem("accessToken", data.accessToken); 

            console.log("토큰 재발급 성공. 기존 요청 재시도.");

            // 3. 실패했던 원래 요청 재시도 (새 토큰으로 헤더 교체)
            config.headers["Authorization"] = `Bearer ${data.accessToken}`;
            const retryResponse = await fetch(url, config);

            // 재시도한 응답 처리
            return handleResponse(retryResponse);
          } else {
            // 재발급 실패 (리프레시 토큰도 만료됨) -> 로그아웃 처리
            throw new Error("Session expired");
          }
        } catch (refreshError) {
          // 재발급 과정 중 에러 발생 시 로그아웃
          console.error("토큰 재발급 실패:", refreshError);
          localStorage.clear();
          window.location.href = "/login"; // 로그인 페이지로 강제 이동
          return Promise.reject(refreshError);
        }
      }
    }

    // 정상 응답 처리 (401이 아니거나 재발급 로직을 타지 않은 경우)
    return handleResponse(response);
  } catch (error){
    throw error;
  }
}

const handleResponse = async (response) => {
  if (response.ok) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  // 에러 응답 처리
  const errorText = await response.text();
  try {
    const jsonError = JSON.parse(errorText);
    throw new Error(jsonError.message || jsonError.error || errorText);
  } catch (e) {
    if (e.message !== errorText && e instanceof SyntaxError) {
      throw new Error(errorText || `HTTP Error ${response.status}`);
    }
    throw e;
  }
};

export const api = {
  get: (endpoint, params) => request(endpoint, {method: "GET", params}),
  post: (endpoint, body) => request(endpoint, {method: "POST", body}),
  put: (endpoint, body) => request(endpoint, {method: "PUT", body}),
  delete: (endpoint) => request(endpoint, {method: "DELETE"}),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),
}