# Dockerfile.builder
FROM rust

WORKDIR /app

COPY ../ ./
RUN cargo build --release --bin auth_service

CMD ["cargo", "run", "--release", "--bin", "auth_service"]
