use crate::{
    JWT_TOKEN_LIFETIME, jwt::jwt_claims::JWTClaims,
    key_pair::get_loaded_key_pair::get_loaded_key_pair,
};
use chrono::Utc;
use error::error::Error;
use jsonwebtoken::{Algorithm, Header, encode};

// this fn is designed first to check if the refresh token is valid and then to create a jwt
// ! Do not use outside auth microservice!!!
pub async fn create_jwt(user_id: String, user_roles: Vec<String>) -> Result<String, Error> {
    let header = Header::new(Algorithm::RS256);
    let now = Utc::now().naive_utc();
    let jwt_claims: JWTClaims = JWTClaims {
        sub: user_id,
        exp: (now + JWT_TOKEN_LIFETIME).and_utc().timestamp() as usize,
        roles: user_roles,
    };
    let loaded_key_pair = get_loaded_key_pair().read().await;
    let token = encode(&header, &jwt_claims, &loaded_key_pair.private_key)?;

    Ok(token)
}
