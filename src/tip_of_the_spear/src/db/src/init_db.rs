use std::time::Duration;

use env::env::ENV;
use log::{debug, info};
use sqlx::migrate::MigrateDatabase;
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};

pub async fn init_db() -> Result<Pool<Postgres>, sqlx::Error> {
    let db_url: String = format!(
        "postgres://{}:{}@{}:{}/{}",
        &ENV.postgres_user,
        &ENV.postgres_password,
        &ENV.db_address,
        &ENV.db_port,
        &ENV.postgres_name
    );

    debug!("{}", &db_url);

    let pool = PgPoolOptions::new()
        .idle_timeout(Duration::from_secs(9999))
        .max_connections(25)
        .connect(&db_url)
        .await?;

    if !Postgres::database_exists(&db_url).await.unwrap_or(false) {
        println!("Creating database {}", &db_url);
        match Postgres::create_database(&db_url).await {
            Ok(_) => println!("Create db success"),
            Err(error) => panic!("error: {}", error),
        }
    } else {
        println!("Database already exists");
    }

    info!("Connected to PostgreSQL database at {}", &db_url);
    Ok(pool)
}
