use chrono::NaiveDateTime;

#[derive(sqlx::FromRow, Debug)]
pub struct KeyPairs {
    pub key_pair_id: i32,
    pub private_pem: Vec<u8>,
    pub public_pem: Vec<u8>,
    pub created_at: NaiveDateTime,
}

// r#"
//     CREATE TABLE IF NOT EXISTS KeyPairs (
//         key_pair_id SERIAL PRIMARY KEY,
//         private_pem BYTEA NOT NULL,
//         public_pem BYTEA NOT NULL,
//         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
//     );
// "#,
