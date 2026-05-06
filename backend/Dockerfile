# Dockerfile
FROM node:18

# CÀI PYTHON + FFMPEG
RUN apt-get update && apt-get install -y \
    python3 python3-venv ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# TẠO VENV RIÊNG
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# CÀI WHISPER TRONG VENV (KHÔNG CẦN --break-system-packages)
RUN pip install --no-cache-dir faster-whisper yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["node", "index.js"]