use actix_web::{post, web, HttpResponse};

use auth::{
    account::check_credentials::check_credentials, jwt::create_jwt::create_jwt,
    refresh_token::create_refresh_token::create_refresh_token,
};
use error::error::Error;
use log::info;
use serde::{Deserialize, Serialize};
use utils::insure_len::insure_len;
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Login::Req)]
pub struct Req {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Login::Res)]
struct Res {
    status: &'static str,
    data: DataRes,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Login::Res::DataRes)]
struct DataRes {
    refresh_token: String,
    jwt: String,
}

#[utoipa::path(
    post,
    path = "/login",
    request_body = Req,
    responses(
        (status = 200, description = "Login successful", body = Res, example = json!({
            "status": "success",
            "data": {
                "refresh_token": "abc123xyz456",
                "jwt": "abc123xyz456"
            }
        })),
        (status = 401, description = "Unauthorized", body = Res, example = json!({
            "status": "incorrect credential",
            "data": ""
        })),
        (status = 409, description = "Conflict", body = Res, example = json!({
            "status": "account already exists",
            "data": ""
        }))
    ),
    security(),
    tag = "Auth"
)]
#[post("/login")]
pub async fn post_login(body: web::Json<Req>) -> Result<HttpResponse, Error> {
    insure_len(&body.username, 5, 20)?;
    insure_len(&body.password, 5, 30)?;

    let (account_id, role) = check_credentials(&body.username, &body.password).await?;
    let refresh_token = create_refresh_token(account_id, &role).await?;
    let jwt = create_jwt(account_id.to_string(), vec![role]).await?;

    return Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: DataRes { refresh_token, jwt },
    }));
}
