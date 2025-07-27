use actix_web::{HttpRequest, HttpResponse, Responder, web};
use api_gateway::build_actix_responce::build_actix_responce;
use api_gateway::{
    endpoint_allowed::endpoint_allowed, get_endpoint_data_yaml::get_endpoint_data_yaml,
    route_request::route_request,
};
use auth::api_gateway_authorize::api_gateway_authorize;
use caching::{
    cache_http_res::cache_http_res, fetch_from_cache::fetch_from_cache,
    is_caching_enabled::is_caching_enabled, random_cache_invalidation::random_cache_invalidation,
};
use config_yaml::config_yaml::Route;
use log::info;
use reqwest::Client;

pub async fn main_handler(
    req: HttpRequest,
    route: web::Data<Route>,
    body: web::Bytes,
    request_client: web::Data<Client>,
) -> Result<impl Responder, actix_web::Error> {
    let full_endpoints = req.path().to_string();
    let endpoint_tree: Vec<&str> = req
        .path()
        .trim_start_matches('/')
        .split('/')
        .skip(3)
        .collect();
    dbg!(&full_endpoints, &endpoint_tree);
    let yaml_route_data = route.get_ref();
    let request_client = request_client.get_ref();
    let endpoint_yaml_data = get_endpoint_data_yaml(&endpoint_tree, yaml_route_data);
    let (is_caching_enabled, cache_exp_time) = is_caching_enabled(&endpoint_yaml_data);

    endpoint_allowed(&yaml_route_data, &endpoint_yaml_data)?;

    let account_data = api_gateway_authorize(yaml_route_data, &endpoint_yaml_data, &req).await?;
    let injected_headers: Vec<(String, String)> = match &account_data {
        None => Vec::new(),
        Some(e) => {
            let mut headers: Vec<(String, String)> = Vec::with_capacity(4);
            headers.push(("Authorization".into(), format!("Bearer {}", e.bearer_token)));
            headers.push(("X-User-Id".into(), e.x_user_id.to_string()));
            headers.push(("X-Roles".into(), e.x_roles.join(",")));
            headers
        }
    };

    let cached_data = fetch_from_cache(&full_endpoints, &account_data, is_caching_enabled).await?;
    if let Some((cached_http_res, exp)) = cached_data {
        if !random_cache_invalidation(exp, cache_exp_time) {
            let actix_res = build_actix_responce(cached_http_res).await?;
            info!("loaded from cache!");
            return Ok(actix_res);
        }
    }

    let microservice_response = route_request(
        &endpoint_tree,
        &req,
        yaml_route_data,
        &body,
        &endpoint_yaml_data,
        &request_client,
        &injected_headers,
    )
    .await?;

    cache_http_res(
        &microservice_response,
        &full_endpoints,
        &account_data,
        cache_exp_time,
        is_caching_enabled,
    )
    .await?;

    let actix_res = build_actix_responce(microservice_response).await?;

    return Ok(actix_res);

    // let body_str = match std::str::from_utf8(&body) {
    //     Ok(s) => s.to_string(),
    //     Err(e) => {
    //         eprintln!("Body is not valid UTF-8: {}", e);
    //         // Fallback for non-UTF-8: convert to hex or return a placeholder
    //         format!("Non-UTF-8 body (hex): {:x}", body)
    //     }
    // };
}
