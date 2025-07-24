use actix_web::http::Method as ActixMethod;
use error::error::Error;
use reqwest::Method as ReqwestMethod;

pub fn convert_method(method: ActixMethod) -> Result<ReqwestMethod, Error> {
    let method = match method {
        ActixMethod::GET => ReqwestMethod::GET,
        ActixMethod::POST => ReqwestMethod::POST,
        ActixMethod::PUT => ReqwestMethod::PUT,
        ActixMethod::DELETE => ReqwestMethod::DELETE,
        ActixMethod::PATCH => ReqwestMethod::PATCH,
        ActixMethod::HEAD => ReqwestMethod::HEAD,
        ActixMethod::OPTIONS => ReqwestMethod::OPTIONS,
        _ => return Err(Error::Internal("Method not supported".to_string())),
    };

    Ok(method)
}
