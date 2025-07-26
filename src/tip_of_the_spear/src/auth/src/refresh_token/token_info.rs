use chrono::NaiveDateTime;

#[derive(sqlx::FromRow, Debug)]
pub struct TokenInfo {
    pub id: i32,
    pub refresh_token: String,
    pub role: String,
    pub refresh_token_creation_date: NaiveDateTime,
    pub username: String,
    pub account_creation_date: NaiveDateTime,
}
