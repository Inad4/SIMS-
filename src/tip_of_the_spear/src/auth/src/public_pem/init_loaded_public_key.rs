use std::sync::Arc;

use chrono::Utc;
use error::error::Error;
use log::{error, info};
use tokio::time::Duration;
use tokio::{sync::RwLock, time::interval};

use crate::public_pem::get_loaded_public_key::get_loaded_public_key;
use crate::public_pem::{LOADED_PUBLIC_KEY, fetch_public_key::fetch_public_key};

pub async fn init_loaded_public_key(full_public_pem_url: &String) -> Result<(), Error> {
    let public_key = fetch_public_key(full_public_pem_url).await?;

    let _ = LOADED_PUBLIC_KEY
        .set(Arc::new(RwLock::new(public_key)))
        .map_err(|e| {
            error!("Was unable to set public key: {}", e);
            panic!();
        });

    let url_clone = full_public_pem_url.clone();

    tokio::spawn(async move {
        let mut interval = interval(Duration::from_secs(15));
        info!("background public key expiration detector active");

        loop {
            interval.tick().await;

            let loaded_key_pair = get_loaded_public_key();
            let now = Utc::now().naive_utc();

            {
                let key_read = loaded_key_pair.read().await;
                if now <= key_read.expiration {
                    continue; // not expired
                }
                info!("Public key expired. Refreshing...");
            }

            match fetch_public_key(&url_clone).await {
                Ok(new_key) => {
                    let mut key_write = loaded_key_pair.write().await;
                    *key_write = new_key;
                    info!("Successfully refreshed public key.");
                }
                Err(err) => {
                    error!("Failed to fetch updated public key: {:?}", err);
                }
            }
        }
    });

    Ok(())
}
