use actix_web::{Scope, web};
use config_yaml::config_yaml::Version;
pub mod main_handler;
use log::info;

use crate::routes::get_health::get_health;

pub fn version(version_config: Version) -> Scope {
    let mut scope = web::scope(&format!("/{}", version_config.version)).service(get_health);

    for route in version_config.routes {
        let route_data = web::Data::new(route.clone());
        info!(
            "/api/{}{} router was created",
            &version_config.version, &route.path
        );

        let debug = format!("{}/{{tail:.*}}", &route.path.trim_end_matches('/'));
        info!("{}", &debug);

        scope = scope
            .service(
                web::resource(&format!("{}/{{tail:.*}}", route.path.trim_end_matches('/')))
                    .app_data(route_data.clone())
                    .route(web::route().to(main_handler::main_handler)),
            )
            .service(
                web::resource(&format!("{}", route.path.trim_end_matches('/')))
                    .app_data(route_data.clone())
                    .route(web::route().to(main_handler::main_handler)),
            );
    }

    scope
}
