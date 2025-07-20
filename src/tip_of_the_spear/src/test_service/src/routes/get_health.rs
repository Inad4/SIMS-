use actix_web::{HttpResponse, get};
use error::error::Error;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Health::Res)]
struct Res {
    status: &'static str,
    data: &'static str,
}

#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "Good health", body = Res, example = json!({
            "status": "success",
            "data": ""
        })),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Health"
)]
#[get("/health")]
pub async fn get_health() -> Result<HttpResponse, Error> {
    Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: "Healthy :P",
    }))
}
