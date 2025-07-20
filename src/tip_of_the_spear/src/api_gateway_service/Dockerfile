# Dockerfile.builder
FROM rust

WORKDIR /app

COPY ../ ./
RUN cargo build --release

CMD ["cargo", "run", "--release", "--bin", "api_gateway_service"]
