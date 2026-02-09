# === [Stage 1: Build] ===
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 의존성 설치
COPY package.json package-lock.json ./

# [중요] npm ci는 package-lock.json을 기준으로 정확하게 설치합니다.
# 만약 에러가 난다면 'npm install'로 바꿔보세요.
RUN npm ci

# 2. 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# [디버깅] 빌드가 잘 됐는지 로그로 확인 (빌드 단계에서 멈추면 여기서 확인 가능)
RUN echo "Build Directory Contents:" && ls -la build

# === [Stage 2: Serve] ===
FROM nginx:alpine

# 1. Nginx 기본 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2. 기존 Nginx 샘플 파일 삭제 (충돌 방지)
RUN rm -rf /usr/share/nginx/html/*

# 3. 빌드 결과물을 Nginx 폴더로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 4. 권한 설정 (혹시 모를 접근 권한 문제 해결)
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]