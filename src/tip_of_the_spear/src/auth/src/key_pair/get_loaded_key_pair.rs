use std::sync::Arc;

use tokio::sync::RwLock;

use crate::key_pair::{LOADED_KEY_PAIR, key_pair::KeyPair};

pub fn get_loaded_key_pair() -> &'static Arc<RwLock<KeyPair>> {
    LOADED_KEY_PAIR
        .get()
        .expect("Loaded key pair is not initialized")
}

// use sqlx::{Pool, Postgres};

// use crate::DB;

// pub fn get_pool() -> &'static Pool<Postgres> {
//     DB.get().expect("Database pool is not initialized")
// }
