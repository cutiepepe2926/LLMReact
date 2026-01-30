const BASE_URL = "http://localhost:8080";

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

    // 6. HTTP 상태 코드가 성공(200~299)인 경우
    if (response.ok) {
        const text = await response.text();
        // 비어있으면 빈 객체, 아니면 파싱
        return text ? JSON.parse(text) : {};
    }

    // 7. HTTP 상태 코드가 에러(4xx, 5xx)인 경우
    // 비록 Java 코드는 DTO를 리턴하지만, 혹시 모를 Spring Security 필터 에러 등을 대비
    const errorText = await response.text();
    
    try{
      return errorText ? JSON.parse(errorText) : {};
    }catch(e){
      throw new Error(errorText || `HTTP Error ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, params) => request(endpoint, {method: "GET", params}),
  post: (endpoint, body) => request(endpoint, {method: "POST", body}),
  put: (endpoint, body) => request(endpoint, {method: "PUT", body}),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),
  delete: (endpoint) => request(endpoint, {method: "DELETE"})
}