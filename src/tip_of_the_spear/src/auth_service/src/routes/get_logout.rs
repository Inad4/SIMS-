use actix_web::{HttpMessage, HttpRequest, HttpResponse};
use auth::{
    microservice_auth_middleware::HeaderData,
    refresh_token::delete_refresh_token::delete_refresh_token,
};
use error::error::Error;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Auth::Logout::Res)]
struct Res {
    status: &'static str,
    data: &'static str,
}

#[utoipa::path(
    get,
    path = "/logout",
    responses(
        (status = 200, description = "logout successful", body = Res, example = json!({
            "status": "success",
            "data": ""
        })),
        (status = 401, description = "Unauthorized", body = Res, example = json!({
            "status": "Unauthorized access",
            "data": ""
        })),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Auth"
)]
// #[get("/auth/logout")]
pub async fn get_logout(req: HttpRequest) -> Result<HttpResponse, Error> {
    let extensions = req.extensions();
    let token_data = match extensions.get::<HeaderData>() {
        None => return Err(Error::Unauthorized("Unauthorized access".to_string())),
        Some(e) => e,
    };

    delete_refresh_token(&token_data.bearer_token).await?;

    Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: "",
    }))
}
