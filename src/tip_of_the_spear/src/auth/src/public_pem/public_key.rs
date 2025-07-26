use chrono::NaiveDateTime;
use jsonwebtoken::DecodingKey;

pub struct PublicKey {
    pub public_key: DecodingKey,
    pub public_pem: Vec<u8>,
    pub expiration: NaiveDateTime,
}
