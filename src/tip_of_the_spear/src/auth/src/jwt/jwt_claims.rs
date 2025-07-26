use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTClaims {
    pub sub: String,        // User ID
    pub exp: usize,         // Expiration time (Unix timestamp)
    pub roles: Vec<String>, // User roles
}
