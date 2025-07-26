use crypto::compare_hash::compare_hash;
use db::get_pool::get_pool;
use db::structs::account::Accounts;
use serde::{Deserialize, Serialize};

use error::error::Error;

#[derive(Serialize, Deserialize)]
struct Res {
    status: String,
    data: &'static str,
}

pub async fn check_credentials(
    username: &String,
    password: &String,
) -> Result<(i32, String), Error> {
    let pool = get_pool();

    let db_res: Option<Accounts> = sqlx::query_as(
        r#"
            SELECT * FROM Accounts
                WHERE username = $1
            ;
        "#,
    )
    .bind(username)
    .fetch_optional(pool)
    .await?;

    let account = match db_res {
        Some(value) => value,
        None => return Err(Error::Conflict("Invalid username or password!".to_string())),
    };

    match compare_hash(password, &account.password).await? {
        true => Ok((account.account_id, account.role)),
        false => Err(Error::Conflict("Invalid username or password!".to_string())),
    }
}
