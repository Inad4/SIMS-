use db::get_pool::get_pool;
use error::error::Error;
use log::error;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::key_pair::{
    LOADED_KEY_PAIR, generate_rsa_token_pair::generate_token_pair,
    get_loaded_key_pair::get_loaded_key_pair,
};

// ! Do not use outside auth microservice!!!
pub async fn roll_new_key_pair() -> Result<(), Error> {
    let key_pair = generate_token_pair()?;
    let pool = get_pool();

    sqlx::query(
        r#"

            INSERT INTO KeyPairs
                (private_pem, public_pem)
            VALUES ($1, $2);

        "#,
    )
    .bind(&key_pair.private_pem)
    .bind(&key_pair.public_pem)
    .execute(pool)
    .await?;

    if LOADED_KEY_PAIR.initialized() {
        let loaded_key_pair = get_loaded_key_pair();
        *loaded_key_pair.write().await = key_pair;
    } else {
        let _ = LOADED_KEY_PAIR
            .set(Arc::new(RwLock::new(key_pair)))
            .map_err(|e| {
                error!("Was unable to set error: {}", e);
                panic!();
            });
    }

    Ok(())
}

// r#"
//     CREATE TABLE IF NOT EXISTS KeyPairs (
//         key_pair_id SERIAL PRIMARY KEY,
//         private_key VARCHAR(256) NOT NULL,
//         public_key VARCHAR(256) NOT NULL,
//         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
//     );
// "#,
