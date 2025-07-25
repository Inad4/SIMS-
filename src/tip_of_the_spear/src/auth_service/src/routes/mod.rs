use actix_web::{web, Scope};
use auth::microservice_auth_middleware::MicroserviceAuthMiddleware;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod get_account_me;
pub mod get_logout;
pub mod get_public_pem;
pub mod post_login;
pub mod post_refresh_session;
pub mod post_signup;
use crate::api_docs;

pub fn routes() -> Scope {
    web::scope("")
        .service(
            SwaggerUi::new("/api-docs/{_:.*}")
                .url("/api-docs/openapi.json", api_docs::ApiDoc::openapi()),
        )
        .service(post_login::post_login)
        .service(post_signup::post_signup)
        .service(post_refresh_session::post_refresh_session)
        .service(get_public_pem::get_public_pem)
        .service(
            web::resource("/logout")
                .wrap(MicroserviceAuthMiddleware)
                .route(web::get().to(get_logout::get_logout)),
        )
        .service(
            web::resource("/account/me")
                .wrap(MicroserviceAuthMiddleware)
                .route(web::get().to(get_account_me::get_account_me)),
        )
}
