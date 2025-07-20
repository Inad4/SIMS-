pub const QUERIES: [&str; 3] = [
    r#"
        CREATE TABLE IF NOT EXISTS Accounts (
            account_id SERIAL PRIMARY KEY,
            username VARCHAR(64) NOT NULL UNIQUE,
            password VARCHAR(256) NOT NULL,
            role VARCHAR(16) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    "#,
    r#"
        CREATE TABLE IF NOT EXISTS RefreshTokens (
            refresh_token_id SERIAL PRIMARY KEY,
            account_id INTEGER NOT NULL,
            refresh_token VARCHAR(256) NOT NULL UNIQUE,
            role VARCHAR(16) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE
        );
    "#,
    r#"
        CREATE TABLE IF NOT EXISTS KeyPairs (
            key_pair_id SERIAL PRIMARY KEY,
            private_pem BYTEA NOT NULL,
            public_pem BYTEA NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    "#,
];
