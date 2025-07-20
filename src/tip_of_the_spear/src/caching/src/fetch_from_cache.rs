use crate::{create_cache_key::create_cache_key, get_redis_pool::get_redis_pool};
use api_gateway::universal_http_response::UniversalHttpResponse;
use auth::api_gateway_authorize::AccountData;
use chrono::{NaiveDateTime, Utc};
use error::error::Error;
use redis::TypedCommands;

pub async fn fetch_from_cache(
    full_endpoints: &String,
    account_data: &Option<AccountData>,
    is_caching_enabled: bool,
) -> Result<Option<(UniversalHttpResponse, NaiveDateTime)>, Error> {
    if !is_caching_enabled {
        return Ok(None);
    }

    let mut pool = get_redis_pool()?;

    let key = create_cache_key(full_endpoints, account_data);

    let value: Option<String> = pool.get(&key)?;
    let value = match value {
        Some(e) => e,
        None => return Ok(None),
    };
    let ttl = pool.ttl(key)?.raw() as i64;
    let expiration = Utc::now().naive_utc() + chrono::Duration::seconds(ttl);

    let uni_http_res: UniversalHttpResponse = serde_json::from_str(&value)?;

    Ok(Some((uni_http_res, expiration)))
}
