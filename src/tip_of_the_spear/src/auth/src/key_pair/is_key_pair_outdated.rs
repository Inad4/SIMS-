use chrono::Utc;
use db::{get_pool::get_pool, structs::key_pairs::KeyPairs};
use error::error::Error;

use crate::KEY_PAIR_TOKEN_LIFETIME;

// ! Do not use outside auth microservice!!!
pub async fn is_key_pair_outdated() -> Result<bool, Error> {
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
        None => return Ok(true),
    };
    let now = Utc::now().naive_utc();

    let expiration_time = latest_key_pair.created_at + KEY_PAIR_TOKEN_LIFETIME;

    Ok(now > expiration_time)
}
