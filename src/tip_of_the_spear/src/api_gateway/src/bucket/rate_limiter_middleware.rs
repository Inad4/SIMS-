use actix_web::{
    Error,
    body::MessageBody,
    dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready},
};
use std::rc::Rc;
use std::{
    future::{Ready, ready},
    net::IpAddr,
};

use crate::bucket::leaky_bucket_reate_limiter::LeakyBucketRateLimiter;

pub struct HeaderData {
    pub bearer_token: String,
    pub x_user_id: i32,
    pub x_roles: Vec<String>,
}

pub struct RateLimiterMiddleware;

impl<S, B> Transform<S, ServiceRequest> for RateLimiterMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = RateLimiterService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RateLimiterService {
            service: Rc::new(service),
            rate_limiter: LeakyBucketRateLimiter::new(100, 5.),
        }))
    }
}

pub struct RateLimiterService<S> {
    service: Rc<S>,
    rate_limiter: LeakyBucketRateLimiter,
}

impl<S, B> Service<ServiceRequest> for RateLimiterService<S>
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
        let rate_limiter = self.rate_limiter.clone();
        let ip = req
            .connection_info()
            .realip_remote_addr()
            .and_then(|addr| addr.parse().ok())
            .unwrap_or_else(|| IpAddr::V4(std::net::Ipv4Addr::new(0, 0, 0, 0)));

        Box::pin(async move {
            if rate_limiter.check_rate_limit(ip).await {
                service.call(req).await
            } else {
                Err(actix_web::error::ErrorTooManyRequests(
                    "Rate limit exceeded",
                ))
            }
        })
    }
}

// Middleware definition
// pub struct LeakyBucketMiddleware {
//     rate_limiter: LeakyBucketRateLimiter,
// }

// impl LeakyBucketMiddleware {
//     pub fn new(capacity: u32, leak_rate: f64) -> Self {
//         Self {
//             rate_limiter: LeakyBucketRateLimiter::new(capacity, leak_rate),
//         }
//     }
// }

// impl<S, B> Transform<S, ServiceRequest> for LeakyBucketMiddleware
// where
//     S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
//     S::Future: 'static,
//     B: MessageBody + 'static, // Align with AuthMiddleware
// {
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type InitError = ();
//     type Transform = LeakyBucketMiddlewareService<S>;
//     type Future = Ready<Result<Self::Transform, Self::InitError>>;

//     fn new_transform(&self, service: S) -> Self::Future {
//         ready(Ok(LeakyBucketMiddlewareService {
//             service: Rc::new(service),
//             rate_limiter: self.rate_limiter.clone(),
//         }))
//     }
// }

// pub struct LeakyBucketMiddlewareService<S> {
//     service: Rc<S>,
//     rate_limiter: LeakyBucketRateLimiter,
// }

// impl<S, B> Service<ServiceRequest> for LeakyBucketMiddlewareService<S>
// where
//     S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
//     S::Future: 'static,
//     B: MessageBody + 'static,
// {
//     type Response = ServiceResponse<B>;
//     type Error = Error;
//     type Future = Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>>>>;

//     forward_ready!(service);

//     fn call(&self, req: ServiceRequest) -> Self::Future {
//         let service = Rc::clone(&self.service);
//         let rate_limiter = self.rate_limiter.clone();
//         let ip = req
//             .connection_info()
//             .realip_remote_addr()
//             .and_then(|addr| addr.parse().ok())
//             .unwrap_or_else(|| IpAddr::V4(std::net::Ipv4Addr::new(0, 0, 0, 0)));

//         Box::pin(async move {
//             if rate_limiter.check_rate_limit(ip).await {
//                 service.call(req).await
//             } else {
//                 Err(actix_web::error::ErrorTooManyRequests(
//                     "Rate limit exceeded",
//                 ))
//             }
//         })
//     }
// }
