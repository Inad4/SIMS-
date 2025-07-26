use std::sync::Arc;

use lazy_static::lazy_static;
use tokio::sync::{OnceCell, RwLock};

use crate::key_pair::key_pair::KeyPair;

pub mod generate_rsa_token_pair;
pub mod get_key_pair_db;
pub mod get_loaded_key_pair;
pub mod init_key_pair;
pub mod is_key_pair_outdated;
pub mod key_pair;
pub mod roll_new_key_pair;

lazy_static! {
    // ! DO NOT USE THIS VARIABLE OUTSIDE THE AUTH MICROSERVICE!!!!!
    //IT WILL CAUSE THE WHOLE SYNC KEYPAIR SYSTEM TO TRIGGER
    pub static ref LOADED_KEY_PAIR: OnceCell<Arc<RwLock<KeyPair>>> = OnceCell::const_new();
}
