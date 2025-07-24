use actix_web::{post, web, HttpResponse};

use auth::{
    account::{account_exists::account_exists, create_account::create_account},
    jwt::create_jwt::create_jwt,
    refresh_token::create_refresh_token::create_refresh_token,
};
use error::error::Error;
use serde::{Deserialize, Serialize};
use utils::insure_len::insure_len;
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Signup::Req)]
pub struct Req {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Signup::Res)]
struct Res {
    status: &'static str,
    data: DataRes,
}

#[derive(Serialize, Deserialize, ToSchema)]
#[schema(as = Post::Auth::Signup::Res::DataRes)]
struct DataRes {
    refresh_token: String,
    jwt: String,
}

#[utoipa::path(
    post,
    path = "/signup",
    request_body = Req,
    responses(
        (status = 200, description = "Signup successful", body = Res, example = json!({
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
#[post("/signup")]
pub async fn post_signup(body: web::Json<Req>) -> Result<HttpResponse, Error> {
    insure_len(&body.username, 5, 20)?;
    insure_len(&body.password, 5, 30)?;

    if account_exists(&body.username).await? {
        return Err(Error::Conflict("Account already exists".to_string()));
    }
    //fix the roles pls
    let account_id = create_account(&body.username, &body.password, "user").await?;

    let refresh_token = create_refresh_token(account_id, &"user".to_string()).await?;
    let jwt = create_jwt(account_id.to_string(), vec![String::from("user")]).await?;

    return Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: DataRes { refresh_token, jwt },
    }));
}
