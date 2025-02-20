FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    nano \
    htop \
    curl \
    gnupg \
    build-essential

RUN curl -fsSL https://deb.nodesource.com/setup_18.x| bash - \
    && apt-get install -y nodejs

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r backend/requirements.txt

WORKDIR /app/frontend
RUN npm install
RUN npm run build
RUN npm install -g serve

WORKDIR /app

EXPOSE 3103

CMD ["/app/start.sh"]
