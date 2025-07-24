use lazy_static::lazy_static;
use r2d2::Pool;
use redis::Client;
use tokio::sync::OnceCell;

pub mod cache_http_res;
pub mod create_cache_key;
pub mod fetch_from_cache;
pub mod get_redis_pool;
pub mod init_redis;
pub mod is_caching_enabled;
pub mod random_cache_invalidation;

lazy_static! {
    static ref REDIS_POOL: OnceCell<Pool<Client>> = OnceCell::const_new();
}
