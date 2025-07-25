use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web::PayloadConfig};
use config_yaml::{self, config_yaml::CONFIG_YAML};
use env::env::ENV;
use env_logger::Env;
use log::info;
use std::i128;
pub mod api_docs;
pub mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // let _ = tokio::spawn(async {
    //     let mut buff = Vec::<i128>::new();
    //     let mut growing = true;
    //     loop {
    //         // let moved_len = buff.len();
    //         // tokio::spawn(async move { println!("{}", moved_len) });
    //         if buff.len() < 20_000_000 && growing {
    //             buff.push(i128::MAX);
    //             continue;
    //         } else {
    //             buff.pop();
    //             growing = false;
    //         }
    //         if buff.len() == 0 {
    //             growing = true;
    //         }
    //     }
    // });

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    info!(
        "ADDRESS AND PORT {}:{}",
        ENV.test_address.clone(),
        ENV.test_port
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

        let cors = Cors::permissive();

        // let _ = &CONFIG_YAML.routes;

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .app_data(PayloadConfig::new(64 * 1024 * 1024)) // the max upload is 64mb the voices
            .service(routes::routes())
    })
    .bind((ENV.test_address.clone(), ENV.test_port))?
    .run()
    .await
}
