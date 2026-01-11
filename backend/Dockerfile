############################
# Builder stage
############################
FROM python:3.13-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --upgrade pip

# 依存関係のみ先にコピー
COPY pyproject.toml ./

# wheel をビルド（本番イメージを軽量化）
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels .

############################
# Runtime stage
############################
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 非 root ユーザー作成（ECS 推奨）
RUN addgroup --system app \
 && adduser --system --ingroup app app

# wheel をコピーしてインストール
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# アプリケーションコード
COPY . .

# 権限設定
RUN chown -R app:app /app

USER app

EXPOSE 8000

# ECS/Fargate で SIGTERM を正しく処理
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000"]
