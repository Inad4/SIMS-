use std::sync::Arc;

use chrono::Utc;
use error::error::Error;
use log::error;
use log::info;
use log::warn;
use tokio::sync::RwLock;
use tokio::time::Duration;
use tokio::time::interval;

use crate::KEY_PAIR_TOKEN_LIFETIME;
use crate::key_pair::LOADED_KEY_PAIR;
use crate::key_pair::get_key_pair_db::get_key_pair_db;
use crate::key_pair::get_loaded_key_pair::get_loaded_key_pair;
use crate::key_pair::is_key_pair_outdated::is_key_pair_outdated;
use crate::key_pair::roll_new_key_pair::roll_new_key_pair;

pub async fn init_key_pair() -> Result<(), Error> {
    warn!("init_key_pair");
    let key_pair_db = get_key_pair_db().await?;

    let key_pair_db = match key_pair_db {
        Some(e) => e,
        None => return Ok(roll_new_key_pair().await?),
    };

    if is_key_pair_outdated().await? {
        return Ok(roll_new_key_pair().await?);
    }

    let _ = LOADED_KEY_PAIR
        .set(Arc::new(RwLock::new(key_pair_db)))
        .map_err(|e| {
            error!("Was unable to set error: {}", e);
            panic!();
        });

    tokio::spawn(async move {
        let mut interval = interval(Duration::from_secs(15));
        info!("background key pair expiration detector active");
        loop {
            interval.tick().await;
            let loaded_key_pair = get_loaded_key_pair();
            let loaded_key_pair = loaded_key_pair.read().await;
            let expiration_datetime = loaded_key_pair.creation_time + KEY_PAIR_TOKEN_LIFETIME;
            let now = Utc::now().naive_utc();
            // info!("test");
            if now > expiration_datetime {
                let _ = roll_new_key_pair().await;
            }
        }
    });

    Ok(())
}
