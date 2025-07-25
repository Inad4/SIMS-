use db::get_pool::get_pool;
use error::error::Error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Res {
    status: String,
    data: &'static str,
}

pub async fn delete_refresh_token(refresh_token: &String) -> Result<(), Error> {
    let pool = get_pool();
    sqlx::query(
        r#"
            DELETE FROM RefreshTokens WHERE refresh_token = $1;
        "#,
    )
    .bind(refresh_token)
    .execute(pool)
    .await?;

    Ok(())
}
