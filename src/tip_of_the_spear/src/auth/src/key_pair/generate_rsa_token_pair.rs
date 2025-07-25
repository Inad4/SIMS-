use crate::key_pair::KeyPair;
use chrono::Utc;
use error::error::Error;
use jsonwebtoken::{DecodingKey, EncodingKey};
use openssl::rsa::Rsa;

// could be used outside the auth microservice if you really want :>
pub fn generate_token_pair() -> Result<KeyPair, Error> {
    let rsa = Rsa::generate(2048)?;
    let private_pem = rsa.private_key_to_pem()?;
    let public_pem = rsa.public_key_to_pem()?;

    let encoding_key = EncodingKey::from_rsa_pem(&private_pem)?;
    let decoding_key = DecodingKey::from_rsa_pem(&public_pem)?;
    let now = Utc::now().naive_utc();

    Ok(KeyPair {
        private_key: encoding_key,
        public_key: decoding_key,
        private_pem,
        public_pem,
        creation_time: now,
    })
}
