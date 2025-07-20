use db::{get_pool::get_pool, structs::key_pairs::KeyPairs};
use error::error::Error;
use jsonwebtoken::{DecodingKey, EncodingKey};

use crate::key_pair::KeyPair;

// ! Do not use outside auth microservice!!!
pub async fn get_key_pair_db() -> Result<Option<KeyPair>, Error> {
    let pool = get_pool();

    let latest_key_pair: Option<KeyPairs> = sqlx::query_as(
        r#"
            SELECT * FROM KeyPairs ORDER BY created_at DESC LIMIT 1;
        "#,
    )
    .fetch_optional(pool)
    .await?;
    let latest_key_pair = match latest_key_pair {
        Some(e) => e,
        None => return Ok(None),
    };

    let encoding_key = EncodingKey::from_rsa_pem(&latest_key_pair.private_pem)?;
    let decoding_key = DecodingKey::from_rsa_pem(&latest_key_pair.public_pem)?;

    Ok(Some(KeyPair {
        private_key: encoding_key,
        public_key: decoding_key,
        private_pem: latest_key_pair.private_pem,
        public_pem: latest_key_pair.public_pem,
        creation_time: latest_key_pair.created_at,
    }))
}
