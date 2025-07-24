use chrono::Utc;

use crate::{REFRESH_TOKEN_LIFETIME, refresh_token::token_info::TokenInfo};

pub fn is_refresh_token_expired(token_info: &TokenInfo) -> bool {
    let now = Utc::now().naive_utc();

    let expiration_time = token_info.refresh_token_creation_date + REFRESH_TOKEN_LIFETIME;

    now > expiration_time
}
