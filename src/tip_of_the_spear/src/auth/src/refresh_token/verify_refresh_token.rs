use db::get_pool::get_pool;
use error::error::Error;

use crate::refresh_token::{
    is_refresh_token_expired::is_refresh_token_expired, token_info::TokenInfo,
};

// ! Do not use outside auth microservice!!!
pub async fn verify_refresh_token(refresh_token: &String) -> Result<TokenInfo, Error> {
    let pool = get_pool();

    let db_res: Option<TokenInfo> = sqlx::query_as(
        r#"
        SELECT
            RefreshTokens.refresh_token,
            RefreshTokens.role,
            RefreshTokens.created_at AS refresh_token_creation_date,
            Accounts.username,
            Accounts.account_id AS id,
            Accounts.created_at AS account_creation_date
        FROM
            RefreshTokens
        INNER JOIN Accounts ON
            RefreshTokens.account_id = Accounts.account_id
        WHERE refresh_token = $1;
    "#,
    )
    .bind(refresh_token)
    .fetch_optional(pool)
    .await?;

    let token_info = match db_res {
        Some(e) => e,
        None => return Err(Error::Unauthorized("Invalid refresh token".to_string())),
    };

    if is_refresh_token_expired(&token_info) {
        return Err(Error::Unauthorized("Refresh token has expired".to_string()));
    }

    Ok(token_info)
}
