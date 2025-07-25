use argon2::Params;
use dotenv::dotenv;
use lazy_static::lazy_static;
use log::error;
use std::{env, path::Path};

#[derive(Debug, Clone)]
pub struct Env {
    pub api_gateway_address: String,
    pub api_gateway_port: u16,
    pub test_address: String,
    pub test_port: u16,

    pub postgres_user: String,
    pub postgres_name: String,
    pub postgres_password: String,

    pub db_address: String,
    pub db_port: String,

    pub auth_port: u16,
    pub auth_address: String,
}

pub const ARGON2_PARAMS: Result<Params, argon2::Error> = Params::new(
    8192, // Memory cost
    1,    // Iterations
    2,    // Parallelism
    None, // Optional output length (None uses default)
);

pub fn load_config() -> Env {
    // let env_path = Path::new("../.env");

    // if let Err(e) = dotenv::from_path(env_path) {
    //     error!("Failed to load .env file: {}", e);
    // }
    if dotenv().ok().is_none() {
        let env_path = Path::new("../.env");

        if let Err(e) = dotenv::from_path(env_path) {
            error!("Failed to load .env file: {}", e);
        }
    }

    // for (key, value) in env::vars() {
    //     info!("ENV: {}: {}", key, value);
    // }

    Env {
        api_gateway_address: env::var("API_GATEWAY_ADDRESS")
            .unwrap_or_else(|_| "0.0.0.0".to_string()),
        api_gateway_port: env::var("API_GATEWAY_PORT")
            .unwrap_or_else(|_| "443".to_string())
            .parse::<u16>()
            .unwrap_or(443),
        test_address: env::var("TEST_ADDRESS").unwrap_or_else(|_| "0.0.0.0".to_string()),
        test_port: env::var("TEST_PORT")
            .unwrap_or_else(|_| "8001".to_string())
            .parse::<u16>()
            .unwrap_or(6004),

        postgres_user: env::var("POSTGRES_USER").unwrap_or_else(|_| "root".to_string()),
        postgres_password: env::var("POSTGRES_PASSWORD").unwrap_or_else(|_| "root".to_string()),
        postgres_name: env::var("POSTGRES_NAME").unwrap_or_else(|_| "root".to_string()),

        db_port: env::var("DB_PORT").unwrap_or_else(|_| "root".to_string()),
        db_address: env::var("DB_ADDRESS").unwrap_or_else(|_| "root".to_string()),

        auth_address: env::var("AUTH_ADDRESS").unwrap_or_else(|_| "0.0.0.0".to_string()),
        auth_port: env::var("AUTH_PORT")
            .unwrap_or_else(|_| "8001".to_string())
            .parse::<u16>()
            .unwrap_or(6004),
    }
}

lazy_static! {
    pub static ref ENV: Env = load_config();
}
