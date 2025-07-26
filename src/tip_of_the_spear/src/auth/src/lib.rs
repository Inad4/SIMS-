use chrono::Duration;

pub mod account;
pub mod api_gateway_authorize;
pub mod jwt;
pub mod key_pair;
pub mod microservice_auth_middleware;
pub mod public_pem;
pub mod refresh_token;

pub const REFRESH_TOKEN_LIFETIME: Duration = Duration::days(30);
pub const JWT_TOKEN_LIFETIME: Duration = Duration::minutes(30);
pub const KEY_PAIR_TOKEN_LIFETIME: Duration = Duration::days(30);
