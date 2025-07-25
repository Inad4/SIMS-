use actix_cors::Cors;
use actix_web::{
    App, HttpServer,
    middleware::Logger,
    web::{self, PayloadConfig},
};

use auth::public_pem::init_loaded_public_key::init_loaded_public_key;
use caching::init_redis::init_redis;
use config_yaml::config_yaml::CONFIG_YAML;
use env::env::ENV;
use env_logger::Env;
use log::info;
use reqwest::Client;
pub mod api_docs;
pub mod routes;

const APP_NAME: &str = "api_gateway";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    // let provider = init_telemetry();

    init_redis(&CONFIG_YAML.full_redis_url).expect("failed to connect to redis");

    let request_client = Client::builder()
        .user_agent("TipOfTheSpear/1.0")
        .redirect(reqwest::redirect::Policy::limited(10))
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .expect("Failed to build reqwest client");
    // let tracer = init_tracer().expect("nz");

    init_loaded_public_key(&CONFIG_YAML.full_public_pem_url)
        .await
        .expect("failed to init public key");

    info!(
        "ADDRESS AND PORT {}:{}",
        ENV.api_gateway_address.clone(),
        ENV.api_gateway_port
    );
    HttpServer::new(move || {
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

        App::new()
            .wrap(TracingLogger::default())
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .app_data(PayloadConfig::new(64 * 1024 * 1024)) // the max upload is 64mb the voices
            .app_data(web::Data::new(request_client.clone()))
            .service(routes::routes())
    })
    .bind((ENV.api_gateway_address.clone(), ENV.api_gateway_port))?
    .run()
    .await?;

    // provider
    //     .shutdown()
    //     .expect("Failed to close tracer provider");

    return Ok(());
}

use opentelemetry::trace::TracerProvider;
use opentelemetry::{KeyValue, global};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{Resource, propagation::TraceContextPropagator};
use opentelemetry_semantic_conventions::resource;
use std::io;
use std::sync::LazyLock;
use tracing_actix_web::TracingLogger;
use tracing_bunyan_formatter::{BunyanFormattingLayer, JsonStorageLayer};
use tracing_subscriber::{EnvFilter, Registry, layer::SubscriberExt};

static RESOURCE: LazyLock<Resource> = LazyLock::new(|| {
    Resource::builder()
        .with_attribute(KeyValue::new(resource::SERVICE_NAME, APP_NAME))
        .build()
});

fn init_telemetry() -> opentelemetry_sdk::trace::SdkTracerProvider {
    // Start a new otlp trace pipeline.
    // Spans are exported in batch - recommended setup for a production application.
    global::set_text_map_propagator(TraceContextPropagator::new());
    let otlp_exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .with_endpoint("http://telemetry:4317")
        .build()
        .expect("Failed to build the span exporter");
    let provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
        .with_batch_exporter(otlp_exporter)
        .with_resource(RESOURCE.clone())
        .build();
    let tracer = provider.tracer(APP_NAME);

    let env_filter = EnvFilter::try_from_default_env().unwrap_or(EnvFilter::new("info"));
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
    let formatting_layer = BunyanFormattingLayer::new(APP_NAME.into(), std::io::stdout);
    let subscriber = Registry::default()
        .with(env_filter)
        .with(telemetry)
        .with(JsonStorageLayer)
        .with(formatting_layer);

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to install `tracing` subscriber.");

    provider
}
