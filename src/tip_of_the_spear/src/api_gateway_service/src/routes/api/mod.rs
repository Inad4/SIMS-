use actix_web::{Scope, web};
use config_yaml::config_yaml::CONFIG_YAML;
use log::info;

use crate::routes::get_health::get_health;
pub mod version;

pub fn api() -> Scope {
    let mut api_scope = web::scope("/api");

    for version_config in &CONFIG_YAML.versions {
        // info!("/api/{} got created :P", version_config.version);
        let scope = version::version(version_config.clone());
        api_scope = api_scope.service(scope).service(get_health);
    }

    api_scope
}
