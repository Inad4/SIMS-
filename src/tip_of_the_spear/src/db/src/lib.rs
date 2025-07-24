use sqlx::{Pool, Postgres};
use tokio::sync::OnceCell;

pub mod get_pool;
pub mod init_db;
pub mod init_pool;
pub mod init_tables;
pub mod queries;
pub mod structs;

static DB: OnceCell<Pool<Postgres>> = OnceCell::const_new();
