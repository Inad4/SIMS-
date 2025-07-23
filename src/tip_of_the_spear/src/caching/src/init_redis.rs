use std::time::Duration;

use crate::REDIS_POOL;
use error::error::Error;
use log::info;

pub fn init_redis(redis_url: &String) -> Result<(), Error> {
    let client = redis::Client::open(redis_url.clone()).unwrap();
    let pool = r2d2::Pool::builder()
        .connection_timeout(Duration::from_secs(9999))
        .build(client)
        .unwrap();

    let connected = pool.test_on_check_out();
    if !connected {
        return Err(Error::Internal(format!("failed to connect to redis")));
    }

    REDIS_POOL
        .set(pool)
        .map_err(|e| Error::Internal(format!("failed to create redis pool: {}", e)))?;

    info!("successfully inited redis!!");

    Ok(())
}
