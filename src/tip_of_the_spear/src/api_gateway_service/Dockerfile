# Dockerfile.builder
FROM rust

WORKDIR /app

COPY ../ ./
COPY ./Config.yaml ./
RUN cargo build --release

CMD ["cargo", "run", "--release", "--bin", "api_gateway_service"]
