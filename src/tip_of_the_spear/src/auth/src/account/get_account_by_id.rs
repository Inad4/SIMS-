use crypto::compare_hash::compare_hash;
use db::get_pool::get_pool;
use db::structs::account::Accounts;
use serde::{Deserialize, Serialize};

use error::error::Error;

pub async fn get_account_by_id(account_id: i32) -> Result<Accounts, Error> {
    let pool = get_pool();

    let db_res: Option<Accounts> = sqlx::query_as(
        r#"
            SELECT * FROM Accounts
                WHERE account_id = $1
            ;
        "#,
    )
    .bind(account_id)
    .fetch_optional(pool)
    .await?;

    let account = match db_res {
        Some(value) => value,
        None => {
            return Err(Error::Conflict(
                "There is no user with such id!".to_string(),
            ));
        }
    };

    Ok(account)
}
