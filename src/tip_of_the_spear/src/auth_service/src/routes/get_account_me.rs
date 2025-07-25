use actix_web::{HttpMessage, HttpRequest, HttpResponse};
use auth::{
    account::get_account_by_id::get_account_by_id, microservice_auth_middleware::HeaderData,
};
use error::error::Error;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Auth::Account::Me::Res)]
struct Res {
    status: &'static str,
    data: AccountData,
}
#[derive(Serialize, Debug, ToSchema)]
#[schema(as = Get::Auth::Account::Me::Res::AccountData)]
struct AccountData {
    username: String,
    id: i32,
}

#[utoipa::path(
    get,
    path = "/account/me",
    responses(
        (status = 200, description = "account details successful", body = Res, example = json!({
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
pub async fn get_account_me(req: HttpRequest) -> Result<HttpResponse, Error> {
    let extensions = req.extensions();
    let token_data = match extensions.get::<HeaderData>() {
        None => return Err(Error::Unauthorized("Unauthorized access".to_string())),
        Some(e) => e,
    };

    let account = get_account_by_id(token_data.x_user_id).await?;

    Ok(HttpResponse::Ok().json(Res {
        status: "success",
        data: AccountData {
            username: account.username,
            id: token_data.x_user_id,
        },
    }))
}
