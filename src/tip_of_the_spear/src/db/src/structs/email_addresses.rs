use chrono::NaiveDateTime;

#[derive(sqlx::FromRow, Debug)]
pub struct EmailAddresses {
    pub email_address_id: i32,
    pub account_id: i32,
    pub email_address: String,
    pub created_at: NaiveDateTime,
}

// CREATE TABLE IF NOT EXISTS EmailAddresses (
//     email_address_id SERIAL PRIMARY KEY,
//     account_id INTEGER NOT NULL,
//     email_address VARCHAR(512) NOT NULL UNIQUE,
//     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE
// );
