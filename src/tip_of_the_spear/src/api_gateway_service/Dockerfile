# Dockerfile.builder
FROM rust

WORKDIR /app

COPY ../ .
COPY ./api_gateway_service/api_gateway_config.yaml ./
RUN cargo build --release --bin api_gateway_service

CMD ["cargo", "run", "--release", "--bin", "api_gateway_service"]
