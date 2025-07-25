use sqlx::{Pool, Postgres};

use crate::DB;

pub fn get_pool() -> &'static Pool<Postgres> {
    DB.get().expect("Database pool is not initialized")
}
