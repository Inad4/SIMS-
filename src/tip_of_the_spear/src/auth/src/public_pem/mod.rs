use std::sync::Arc;

use lazy_static::lazy_static;
use tokio::sync::{OnceCell, RwLock};

use crate::public_pem::public_key::PublicKey;

pub mod fetch_public_key;
pub mod get_loaded_public_key;
pub mod init_loaded_public_key;
pub mod public_key;

lazy_static! {
    pub static ref LOADED_PUBLIC_KEY: OnceCell<Arc<RwLock<PublicKey>>> = OnceCell::const_new();
}
