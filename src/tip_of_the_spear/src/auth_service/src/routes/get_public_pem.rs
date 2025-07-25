use actix_web::{get, HttpResponse};
use auth::{key_pair::get_loaded_key_pair::get_loaded_key_pair, KEY_PAIR_TOKEN_LIFETIME};
use chrono::NaiveDateTime;
use error::error::Error;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Auth::Logout::Res)]
struct Res {
    status: &'static str,
    data: TokenRes,
}

#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Auth::Logout::TokenRes)]
struct TokenRes {
    public_pem: Vec<u8>,
    naive_expiration_date: NaiveDateTime,
}

#[utoipa::path(
    get,
    path = "/public_pem",
    responses(
        (status = 200, description = "logout successful", body = Res, example = json!({
            "status": "success",
            "data": {
                "public_pem": "shit ton of bytes",
                "naive_expiration_date": "2025-08-12T18:09:24.372830",
            }
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
#[get("/public_pem")]
pub async fn get_public_pem() -> Result<HttpResponse, Error> {
    let loaded_key_pair = get_loaded_key_pair().read().await;
    let public_pem = loaded_key_pair.public_pem.clone();
    let creation_time = loaded_key_pair.creation_time;
    let expiration_time = creation_time + KEY_PAIR_TOKEN_LIFETIME;

    Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: TokenRes {
            public_pem,
            naive_expiration_date: expiration_time,
        },
    }))
}
