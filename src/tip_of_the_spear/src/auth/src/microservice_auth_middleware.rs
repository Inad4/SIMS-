use actix_web::{
    Error, HttpMessage,
    body::MessageBody,
    dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready},
};
use error::error::Error as ErrorHandler;
use std::future::{Ready, ready};
use std::rc::Rc;

pub struct MicroserviceAuthMiddleware;

impl<S, B> Transform<S, ServiceRequest> for MicroserviceAuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = AuthMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddlewareService {
            service: Rc::new(service),
        }))
    }
}

pub struct AuthMiddlewareService<S> {
    service: Rc<S>,
}
#[derive(sqlx::FromRow, Debug)]
pub struct HeaderData {
    pub bearer_token: String,
    pub x_user_id: i32,
    pub x_roles: String,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future =
        std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>>>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = Rc::clone(&self.service);
        Box::pin(async move {
            let auth_header = req
                .headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok())
                .map(|auth| auth.to_string());
            let auth_header = match auth_header {
                Some(e) => e,
                None => {
                    return Err(
                        ErrorHandler::Unauthorized("Invalid or missing token".to_string()).into(),
                    );
                }
            };
            if !auth_header.starts_with("Bearer ") {
                return Err(ErrorHandler::Unauthorized("Invalid token syntax".to_string()).into());
            }

            let token = String::from(&auth_header["Bearer ".len()..]);
            let x_user_id = req.headers().get("X-User-Id").and_then(|h| h.to_str().ok());
            let x_user_id = match x_user_id {
                Some(e) => e,
                None => "12",
            };
            let x_user_id: i32 = x_user_id
                .parse()
                .map_err(|_| ErrorHandler::Unauthorized("Invalid X-User-Id format".to_string()))?;

            let x_roles = req
                .headers()
                .get("X-Roles")
                .and_then(|h| h.to_str().ok())
                .map(|auth| auth.to_string());
            let x_roles = match x_roles {
                Some(e) => e,
                None => "user".to_string(),
            };

            // let x_user_id = match x_user_id {
            //     Some(e) => e,
            //     None => return Err(ErrorHandler::Unauthorized("No X-User-Id".to_string()).into()),
            // };
            // let x_roles = match x_roles {
            //     Some(e) => e,
            //     None => return Err(ErrorHandler::Unauthorized("No X-Roles".to_string()).into()),
            // };

            // fix this woltar
            req.extensions_mut().insert(HeaderData {
                x_roles,
                x_user_id,
                bearer_token: token,
            });
            return service.call(req).await;
        })
    }
}
