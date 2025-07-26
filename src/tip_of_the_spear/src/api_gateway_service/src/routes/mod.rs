use actix_web::{dev::HttpServiceFactory, web};
use api_gateway::bucket::rate_limiter_middleware::RateLimiterMiddleware;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::api_docs;
pub mod api;
pub mod get_health;
pub mod get_index;

pub fn routes() -> impl HttpServiceFactory {
    web::scope("")
        .wrap(RateLimiterMiddleware)
        .service(get_health::get_health)
        .service(get_index::get_index)
        .service(
            SwaggerUi::new("/api-docs/{_:.*}")
                .url("/api-docs/openapi.json", api_docs::ApiDoc::openapi()),
        )
        .service(api::api())
}
