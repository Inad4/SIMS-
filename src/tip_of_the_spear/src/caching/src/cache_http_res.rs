use crate::{create_cache_key::create_cache_key, get_redis_pool::get_redis_pool};
use api_gateway::universal_http_response::UniversalHttpResponse;
use auth::api_gateway_authorize::AccountData;
use error::error::Error;
use redis::TypedCommands;

pub async fn cache_http_res(
    uni_response: &UniversalHttpResponse,
    full_endpoints: &String,
    account_data: &Option<AccountData>,
    expiration_time_seconds: u64,
    is_caching_enabled: bool,
) -> Result<(), Error> {
    if !is_caching_enabled {
        return Ok(());
    }

    let mut pool = get_redis_pool()?;

    let cache_key = create_cache_key(full_endpoints, account_data);
    let serialized_str = serde_json::to_string(uni_response)?;

    pool.set_ex(cache_key, serialized_str, expiration_time_seconds)?;

    Ok(())
}
