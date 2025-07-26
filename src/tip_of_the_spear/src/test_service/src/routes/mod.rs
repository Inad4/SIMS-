use actix_web::{Scope, web};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::api_docs;
pub mod get_health;

pub fn routes() -> Scope {
    web::scope("").service(get_health::get_health).service(
        SwaggerUi::new("/api-docs/{_:.*}")
            .url("/api-docs/openapi.json", api_docs::ApiDoc::openapi()),
    )
}
