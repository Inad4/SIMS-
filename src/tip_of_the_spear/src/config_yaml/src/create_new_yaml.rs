use crate::{
    CONFIG_YAML_PATH,
    config_yaml::{Auth, ConfigYaml, Endpoint, Route, Version},
};
use std::{fs, io::Write};

pub fn create_new_yaml() -> () {
    let default_config_yaml = ConfigYaml {
        full_public_pem_url: "http://auth:8080/public_pem".into(),
        full_redis_url: "redis://127.0.0.1/".into(),
        versions: vec![Version {
            version: "v1".into(),
            routes: vec![
                Route {
                    path: "/auth".into(),
                    service_addresses: vec!["localhost:8000".into(), "localhost:8001".into()],
                    is_root_path: None,
                    strict_mode: Some(false),
                    auth: Auth {
                        full_auth_lockdown: true,
                        authorized_roles: vec!["admin".into(), "user".into()],
                    },
                    endpoints: vec![
                        Endpoint {
                            endpoint_path: "/login".into(),
                            authorized_roles: vec!["admin".into(), "user".into()],
                            auth_required: false,
                            cached: false,
                            expiration_time_seconds: Some(300),
                        },
                        Endpoint {
                            endpoint_path: "/signup".into(),
                            authorized_roles: vec!["admin".into(), "user".into()],
                            auth_required: false,
                            cached: false,
                            expiration_time_seconds: Some(300),
                        },
                    ],
                },
                Route {
                    path: "/example2".into(),
                    service_addresses: vec!["localhost:8002".into(), "localhost:8003".into()],
                    is_root_path: None,
                    strict_mode: Some(false),
                    auth: Auth {
                        full_auth_lockdown: true,
                        authorized_roles: vec!["admin".into()],
                    },
                    endpoints: vec![
                        Endpoint {
                            endpoint_path: "/nz".into(),
                            authorized_roles: vec!["admin".into(), "user".into()],
                            auth_required: false,
                            cached: false,
                            expiration_time_seconds: Some(300),
                        },
                        Endpoint {
                            endpoint_path: "/bomba".into(),
                            authorized_roles: vec!["admin".into(), "user".into()],
                            auth_required: false,
                            cached: false,
                            expiration_time_seconds: Some(300),
                        },
                    ],
                },
            ],
        }],
    };

    let config_yaml_string =
        serde_yaml::to_string(&default_config_yaml).expect("fix yo code please");

    let mut file = fs::File::create(CONFIG_YAML_PATH).unwrap_or_else(|e| {
        log::error!("Couldnt create config.yaml: {}", e);
        panic!()
    });

    file.write_all(config_yaml_string.as_bytes())
        .unwrap_or_else(|e| {
            log::error!("Couldnt write in config.yaml: {}", e);
            panic!()
        });

    return;
}
