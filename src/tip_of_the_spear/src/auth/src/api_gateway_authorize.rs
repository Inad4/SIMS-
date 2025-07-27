use actix_web::HttpRequest;
// use actix_web::{
//     Error, HttpMessage, HttpRequest,
//     body::MessageBody,
//     dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready},
// };
// use api_gateway::{
//     endpoint_allowed::endpoint_allowed, get_endpoint_data_yaml::get_endpoint_data_yaml,
// };
use config_yaml::config_yaml::{Endpoint, Route};
use error::error::Error;
use log::warn;
// use std::future::{Ready, ready};
// use std::rc::Rc;

use crate::{
    jwt::decode_jwt::decode_jwt, public_pem::get_loaded_public_key::get_loaded_public_key,
};

#[derive(sqlx::FromRow, Debug)]
pub struct AccountData {
    pub bearer_token: String,
    pub x_user_id: String,
    pub x_roles: Vec<String>,
}

pub async fn api_gateway_authorize(
    yaml_route_data: &Route,
    endpoint_yaml_data: &Option<Endpoint>,
    req: &HttpRequest,
) -> Result<Option<AccountData>, Error> {
    // if !yaml_route_data.auth.full_auth_lockdown {
    //     return Ok(None::<AccountData>);
    // }

    let autorization_is_enabled: bool = yaml_route_data.auth.full_auth_lockdown
        || endpoint_yaml_data.as_ref().is_some_and(|e| e.auth_required);

    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .map(|auth| auth.to_string());

    if autorization_is_enabled && auth_header.is_none() {
        return Err(Error::Unauthorized(
            "Authorization header required for this endpoint".into(),
        ));
    }

    if auth_header.is_none() {
        return Ok(None::<AccountData>);
    }

    let token = match auth_header {
        Some(auth) if auth.starts_with("Bearer ") => auth.trim_start_matches("Bearer ").to_string(),
        _ => {
            return Err(Error::Unauthorized("Invalid Authorization header".into()));
        }
    };

    let loaded_public_key = get_loaded_public_key().read().await;
    let jwt_data = decode_jwt(&loaded_public_key.public_key, &token).await?;

    let authorized_roles = endpoint_yaml_data
        .as_ref()
        .map(|e| e.authorized_roles.clone())
        .unwrap_or_else(|| yaml_route_data.auth.authorized_roles.clone());

    if !authorized_roles.is_empty()
        && !jwt_data
            .roles
            .iter()
            .any(|role| authorized_roles.contains(role))
        && autorization_is_enabled
    {
        return Err(Error::Unauthorized(
            "User does not have the required roles for this endpoint".into(),
        ));
    }

    let header_data = AccountData {
        bearer_token: token,
        x_user_id: jwt_data.sub,
        x_roles: jwt_data.roles,
    };

    warn!(
        r#"API GATEWAY AUTH HEADERS: {} {} {}"#,
        &header_data.x_roles.join(","),
        &header_data.x_user_id,
        &header_data.bearer_token
    );

    Ok(Some(header_data))
}

// pub struct ApiGatewayAuthMiddleware;

// impl<S, B> Transform<S, ServiceRequest> for ApiGatewayAuthMiddleware
// where
//     S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
//     S::Future: 'static,
//     B: MessageBody + 'static,
// {
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type Transform = AuthMiddlewareService<S>;
//     type InitError = ();
//     type Future = Ready<Result<Self::Transform, Self::InitError>>;

//     fn new_transform(&self, service: S) -> Self::Future {
//         ready(Ok(AuthMiddlewareService {
//             service: Rc::new(service),
//         }))
//     }
// }

// pub struct AuthMiddlewareService<S> {
//     service: Rc<S>,
// }

// impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
// where
//     S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
//     S::Future: 'static,
//     B: MessageBody + 'static,
// {
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type Future =
//         std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>>>>;

//     forward_ready!(service);

//     fn call(&self, req: ServiceRequest) -> Self::Future {
//         let service = Rc::clone(&self.service);

//         Box::pin(async move {
//             let yaml_route_data = req.app_data::<Route>().ok_or_else(|| {
//                 actix_web::error::ErrorInternalServerError(
//                     "Missing microservice route data in app_data",
//                 )
//             })?;

//             let endpoint_tree: Vec<&str> = req
//                 .path()
//                 .trim_start_matches('/')
//                 .split('/')
//                 .skip(3)
//                 .collect();
//             let endpoint_yaml_data = get_endpoint_data_yaml(&endpoint_tree, yaml_route_data);

//             endpoint_allowed(yaml_route_data, &endpoint_yaml_data)?;

//             if !yaml_route_data.auth.auth_required {
//                 req.extensions_mut().insert(None::<AccountData>);
//                 return service.call(req).await;
//             }

//             let auth_header = req
//                 .headers()
//                 .get("Authorization")
//                 .and_then(|h| h.to_str().ok())
//                 .map(|auth| auth.to_string());

//             if endpoint_yaml_data.is_none() && auth_header.is_none() {
//                 return Err(actix_web::error::ErrorUnauthorized(
//                     "Authorization header required for this endpoint",
//                 ));
//             }

//             let token = match auth_header {
//                 Some(auth) if auth.starts_with("Bearer ") => {
//                     auth.trim_start_matches("Bearer ").to_string()
//                 }
//                 _ => {
//                     return Err(actix_web::error::ErrorUnauthorized(
//                         "Missing or invalid Authorization header",
//                     ));
//                 }
//             };

//             let loaded_public_key = get_loaded_public_key().read().await;
//             let jwt_data = decode_jwt(&loaded_public_key.public_key, &token).await?;

//             let authorized_roles = endpoint_yaml_data
//                 .as_ref()
//                 .map(|e| e.authorized_roles.clone())
//                 .unwrap_or_else(|| yaml_route_data.auth.authorized_roles.clone());

//             if !authorized_roles.is_empty()
//                 && !jwt_data
//                     .roles
//                     .iter()
//                     .any(|role| authorized_roles.contains(role))
//             {
//                 return Err(actix_web::error::ErrorForbidden(
//                     "User does not have the required roles for this endpoint",
//                 ));
//             }

//             let header_data = Some(AccountData {
//                 bearer_token: token,
//                 x_user_id: jwt_data.sub as i32,
//                 x_roles: jwt_data.roles,
//             });
//             req.extensions_mut().insert(header_data);

//             service.call(req).await
//         })
//     }
// }
