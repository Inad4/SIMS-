use chrono::NaiveDateTime;
use jsonwebtoken::{DecodingKey, EncodingKey};

pub struct KeyPair {
    pub private_key: EncodingKey,
    pub public_key: DecodingKey,
    pub private_pem: Vec<u8>,
    pub public_pem: Vec<u8>,
    pub creation_time: NaiveDateTime,
}
