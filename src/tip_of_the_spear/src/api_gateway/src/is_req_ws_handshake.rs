use actix_web::HttpRequest;

pub fn is_req_ws_handshake(req: &HttpRequest) -> bool {
    let is_websocket = req.headers().get("upgrade").map_or(false, |h| {
        h.to_str()
            .map_or(false, |v| v.to_lowercase() == "websocket")
    }) && req.headers().get("connection").map_or(false, |h| {
        h.to_str()
            .map_or(false, |v| v.to_lowercase().contains("upgrade"))
    });

    is_websocket
}
