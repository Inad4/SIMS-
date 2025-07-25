use std::sync::Arc;

use tokio::sync::RwLock;

use crate::public_pem::{LOADED_PUBLIC_KEY, public_key::PublicKey};

pub fn get_loaded_public_key() -> &'static Arc<RwLock<PublicKey>> {
    LOADED_PUBLIC_KEY
        .get()
        .expect("Loaded public key is not initialized")
}
