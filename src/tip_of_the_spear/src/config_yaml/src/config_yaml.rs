use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;

#[derive(Deserialize, Default, Serialize, Debug, PartialEq, Clone)]
pub struct ConfigYaml {
    pub full_public_pem_url: String,
    pub full_redis_url: String,
    pub versions: Vec<Version>,
}

#[derive(Deserialize, Default, Serialize, Debug, PartialEq, Clone)]
pub struct Version {
    pub version: String,
    pub routes: Vec<Route>,
}

#[derive(Deserialize, Default, Serialize, Debug, PartialEq, Clone)]
pub struct Route {
    pub path: String,
    pub strict_mode: Option<bool>,
    pub service_addresses: Vec<String>,
    pub auth: Auth,
    pub endpoints: Vec<Endpoint>,
}

#[derive(Deserialize, Default, Serialize, Debug, PartialEq, Clone)]
pub struct Auth {
    pub auth_required: bool,
    pub authorized_roles: Vec<String>,
}

#[derive(Deserialize, Default, Serialize, Debug, PartialEq, Clone)]
pub struct Endpoint {
    pub endpoint_path: String,
    pub authorized_roles: Vec<String>,
    pub cached: bool,
    pub expiration_time_seconds: Option<u64>,
}

lazy_static! {
    pub static ref CONFIG_YAML: ConfigYaml = ConfigYaml::init();
}
