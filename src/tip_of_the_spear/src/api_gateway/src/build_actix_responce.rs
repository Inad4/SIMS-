use actix_web::HttpResponse;
use error::error::Error;
use reqwest::Response;

use crate::{convert_status::convert_status, universal_http_response::UniversalHttpResponse};

pub async fn build_actix_responce(
    uni_http_response: UniversalHttpResponse,
) -> Result<HttpResponse, Error> {
    let status = convert_status(uni_http_response.status)?;
    let mut builder = HttpResponse::build(status);
    for (key, value) in uni_http_response.headers {
        builder.insert_header((key, value));
    }

    let builded_responce = builder.body(uni_http_response.body);

    Ok(builded_responce)
}
