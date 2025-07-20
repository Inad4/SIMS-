use crate::REDIS_POOL;
use error::error::Error;
use r2d2::PooledConnection;
use redis::Client;

pub fn get_redis_pool() -> Result<PooledConnection<Client>, Error> {
    let pool = REDIS_POOL.get().expect("Database pool is not initialized");
    let pool = pool.get()?;

    Ok(pool)
}
