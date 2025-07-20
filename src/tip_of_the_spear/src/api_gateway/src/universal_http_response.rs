use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct UniversalHttpResponse {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: String,
}
