use actix_cors::Cors;

use auth::{account::create_account::create_account, key_pair::init_key_pair::init_key_pair};
use env::env::ENV;
use log::info;
use routes::routes;

use actix_web::{middleware::Logger, web::PayloadConfig, App, HttpServer};
use env_logger::Env;

pub mod api_docs;
pub mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    db::init_pool::init_pool()
        .await
        .expect("Failed to initialize database");
    db::init_tables::init_tables()
        .await
        .expect("Failed to initialize tables");
    init_key_pair()
        .await
        .expect("Failed to initialize key pair");

    let _ = create_account(&"admin".to_string(), &"admin".to_string(), "admin").await;
    info!(
        "ADDRESS AND PORT {}:{}",
        ENV.auth_address.clone(),
        ENV.auth_port
    );
    HttpServer::new(|| {
        // let cors = Cors::default()
        //     .allowed_origin("http://localhost:7004") // Explicitly allow Nuxt frontend origin
        //     .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
        //     .allowed_headers(vec![
        //         actix_web::http::header::AUTHORIZATION,
        //         actix_web::http::header::ACCEPT,
        //         actix_web::http::header::CONTENT_TYPE,
        //     ])
        //     .supports_credentials() // If you're using cookies or auth tokens
        //     .max_age(3600);
        // let _ = *LOADED_KEY_PAIR;
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .app_data(PayloadConfig::new(64 * 1024 * 1024)) // the max upload is 64mb the voices
            .service(routes())
    })
    .bind((ENV.auth_address.clone(), ENV.auth_port))?
    .run()
    .await
}
