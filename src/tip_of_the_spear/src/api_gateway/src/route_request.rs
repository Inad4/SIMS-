use actix_web::{HttpRequest, web};
use config_yaml::config_yaml::{Endpoint, Route};
use error::error::Error;
use reqwest::{Client, Response};

use crate::{
    convert_method::convert_method, is_req_ws_handshake::is_req_ws_handshake,
    universal_http_response::UniversalHttpResponse,
};

pub async fn route_request(
    endpoint_tree: &Vec<&str>,
    incoming_req: &HttpRequest,
    yaml_route_data: &Route,
    incoming_req_body: &web::Bytes,
    endpoint_yaml_data: &Option<Endpoint>,
    request_client: &Client,
    injected_headers: &Vec<(String, String)>,
) -> Result<UniversalHttpResponse, Error> {
    if is_req_ws_handshake(incoming_req) {
        return Err(Error::Internal(
            "WebSockets are not supported for now".to_string(),
        ));
    }

    // replace with a load balancer
    let service_address = yaml_route_data
        .service_addresses
        .first()
        .ok_or_else(|| Error::NotFound())?;

    let target_url = format!("http://{}/{}", service_address, endpoint_tree.join("/"));
    let method = incoming_req.method().clone();
    let method = convert_method(method)?;
    let mut request_builder = request_client.request(method, &target_url);

    for (key, value) in incoming_req.headers() {
        let value = value
            .to_str()
            .map_err(|e| Error::BadRequest(format!("please use valid utf8: {}", e)))?;
        request_builder = request_builder.header(key.as_str(), value);
    }

    for (key, value) in injected_headers {
        request_builder = request_builder.header(key, value);
    }

    if !incoming_req_body.is_empty() {
        request_builder = request_builder.body(incoming_req_body.clone());
    }

    let response = match request_builder.send().await {
        Ok(resp) => resp,
        Err(_) => {
            return Ok(UniversalHttpResponse {
                body: "".into(),
                status: 404,
                headers: Vec::new(),
            });
        }
    };

    let headers = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or_default().to_string()))
        .collect::<Vec<_>>();

    let status = response.status().as_u16();
    let body = response.text().await?;

    let uni_http_res = UniversalHttpResponse {
        body,
        status,
        headers,
    };

    Ok(uni_http_res)
}
