use actix_web::error::PayloadError;
use actix_web::{HttpResponse, ResponseError};
use argon2::password_hash::Error as PassHashError;
use jsonwebtoken::errors::Error as JwtError;
use openssl::error::ErrorStack;
use r2d2::Error as R2D2Error;
use redis::RedisError;
use reqwest::Error as ReqError;
use serde_json::Error as SerdeJsonError;
use std::error::Error as StdError;

use serde::{Deserialize, Serialize};
use std::{fmt, sync::PoisonError};

#[derive(Serialize, Deserialize)]
pub struct ErrorRes {
    status: String,
    data: &'static str,
}

#[derive(Debug)]
pub enum Error {
    Conflict(String),
    Unauthorized(String),
    BadRequest(String),
    Internal(String),
    UniqueNameViolation(String),
    NotFound(),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Conflict(msg) => write!(f, "Conflict: {}", msg),
            Error::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            Error::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            Error::Internal(msg) => write!(f, "Internal error: {}", msg),
            Error::UniqueNameViolation(msg) => write!(f, "Unique constraint violation: {}", msg),
            Error::NotFound() => write!(f, "Not Found"),
        }
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Conflict(msg) => HttpResponse::Conflict().json(ErrorRes {
                status: msg.to_string(),
                data: "",
            }),
            Error::Unauthorized(msg) => HttpResponse::Unauthorized().json(ErrorRes {
                status: msg.to_string(),
                data: "",
            }),
            Error::BadRequest(msg) => HttpResponse::BadRequest().json(ErrorRes {
                status: msg.to_string(),
                data: "",
            }),
            Error::Internal(msg) => HttpResponse::InternalServerError().json(ErrorRes {
                status: msg.to_string(),
                data: "",
            }),
            Error::UniqueNameViolation(msg) => HttpResponse::Conflict().json(ErrorRes {
                status: msg.to_string(),
                data: "",
            }),
            Error::NotFound() => HttpResponse::NotFound().finish(),
        }
    }
}

impl From<sqlx::Error> for Error {
    fn from(err: sqlx::Error) -> Self {
        if let sqlx::Error::Database(db_err) = &err {
            if db_err.code().as_deref() == Some("23000") {
                // SQLSTATE for integrity constraint violation
                if let Some(message) = db_err.message().split("Duplicate entry").nth(1) {
                    return Error::UniqueNameViolation(format!(
                        "Name has already been used: {}",
                        message.trim()
                    ));
                }
            }
        }
        Error::Internal(format!("Database error: {}", err))
    }
}

impl From<PassHashError> for Error {
    fn from(err: PassHashError) -> Self {
        Error::Internal(format!("Crypto hash error: {}", err))
    }
}

impl From<SerdeJsonError> for Error {
    fn from(err: SerdeJsonError) -> Self {
        Error::Internal(format!("Json serialization error: {}", err))
    }
}

impl From<JwtError> for Error {
    fn from(err: JwtError) -> Self {
        Error::Internal(format!("JWT encoding error: {}", err))
    }
}

impl From<R2D2Error> for Error {
    fn from(err: R2D2Error) -> Self {
        Error::Internal(format!("Database connection error: {}", err))
    }
}

impl From<RedisError> for Error {
    fn from(err: RedisError) -> Self {
        Error::Internal(format!("Redis error: {}", err))
    }
}

impl From<PayloadError> for Error {
    fn from(err: PayloadError) -> Self {
        Error::Internal(format!("Payload error: {}", err))
    }
}

impl From<Box<dyn StdError>> for Error {
    fn from(err: Box<dyn StdError>) -> Self {
        Error::Internal(format!(
            "Some crate handlers dont like telling whats the problem: Dynamic error: {}",
            err
        ))
    }
}

impl From<ReqError> for Error {
    fn from(err: ReqError) -> Self {
        Error::Internal(format!("Failed fetching error: {}", err))
    }
}

impl<T> From<PoisonError<T>> for Error {
    fn from(err: PoisonError<T>) -> Self {
        Error::Internal(format!("Multithread error, POISONED: {}", err))
    }
}

impl From<ErrorStack> for Error {
    fn from(err: ErrorStack) -> Self {
        Error::Internal(format!("OpenSSL error: {}", err))
    }
}
