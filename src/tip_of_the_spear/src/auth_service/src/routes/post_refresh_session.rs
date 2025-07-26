use actix_web::{post, web, HttpResponse};

use auth::{
    jwt::create_jwt::create_jwt, refresh_token::verify_refresh_token::verify_refresh_token,
};
use error::error::Error;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::RefreshSession::Req)]
pub struct Req {
    pub refresh_token: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::RefreshSession::Res)]
struct Res {
    status: &'static str,
    data: DataRes,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::RefreshSession::Res::DataRes)]
struct DataRes {
    jwt: String,
}

#[utoipa::path(
    post,
    path = "/refresh_session",
    request_body = Req,
    responses(
        (status = 200, description = "Login successful", body = Res, example = json!({
            "status": "success",
            "data": {
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
#[post("/refresh_session")]
pub async fn post_refresh_session(body: web::Json<Req>) -> Result<HttpResponse, Error> {
    let account_data = verify_refresh_token(&body.refresh_token).await?;
    let jwt = create_jwt(account_data.id.to_string(), vec![account_data.role]).await?;

    return Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: DataRes { jwt },
    }));
}
