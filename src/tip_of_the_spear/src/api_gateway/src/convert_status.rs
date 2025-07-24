use actix_web::http::StatusCode as ActixStatusCode;
use reqwest::StatusCode as ReqwestStatusCode;

// Assuming Error is your custom error type
use error::error::Error;

pub fn convert_status(status: u16) -> Result<ActixStatusCode, Error> {
    ActixStatusCode::from_u16(status)
        .map_err(|e| Error::Internal(format!("Invalid status code: {}", e)))
}
