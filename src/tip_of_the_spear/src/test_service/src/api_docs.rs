use serde::{Deserialize, Serialize};
use utoipa::OpenApi;
use utoipa::{Modify, ToSchema};

use crate::routes;

use utoipa::openapi::security::{Http, HttpAuthScheme, SecurityScheme};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Req {
    pub username: String,
    pub password: String,
}

struct BearerAuthAddon;

impl Modify for BearerAuthAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.as_mut().unwrap();
        components.add_security_scheme(
            "bearer_auth",
            SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
        );
    }
}

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::get_health::get_health,
    ),
    tags(
        (name = "Health", description = "Service health endpoints"),
        // (name = "Users", description = "User management endpoints")
    ),
    modifiers(&BearerAuthAddon),
    security(
        ("bearer_auth" = [])
    )

)]
pub struct ApiDoc;
