use db::get_pool::get_pool;
use error::error::Error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Res {
    status: String,
    data: &'static str,
}

pub async fn account_exists(username: &String) -> Result<bool, Error> {
    let pool = get_pool();

    let account_count: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) AS count
            FROM Accounts
            WHERE username = $1
        ;
    "#,
    )
    .bind(username)
    .fetch_one(pool)
    .await?;

    Ok(account_count > 0)
}
