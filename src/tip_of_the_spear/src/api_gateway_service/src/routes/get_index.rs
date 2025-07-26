use actix_web::{HttpResponse, get};
use config_yaml::config_yaml::CONFIG_YAML;
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
    path = "/",
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
#[get("/")]
pub async fn get_index() -> Result<HttpResponse, Error> {
    for version_config in &CONFIG_YAML.versions {
        for route in &version_config.routes {
            let is_root_path = match route.is_root_path {
                Some(e) => e,
                None => false,
            };
            if is_root_path {
                return Ok(HttpResponse::Found()
                    .append_header((
                        "Location",
                        format!("/api/{}{}", version_config.version, route.path),
                    ))
                    .finish());
            }
        }
    }

    Ok(HttpResponse::NotFound().finish())
}
