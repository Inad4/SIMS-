use crate::config_yaml::ConfigYaml;
use std::collections::HashSet;
use std::hash::Hash;

fn all_elements_unique<T: Eq + Hash>(input: Vec<T>) -> bool {
    let mut seen = HashSet::new();
    for e in input {
        if !seen.insert(e) {
            return false;
        }
    }
    true
}

pub fn insure_config_yaml_is_correct(config_yaml: &ConfigYaml) -> () {
    let mut number_of_routes = 0;
    for version in &config_yaml.versions {
        number_of_routes += version.routes.len();
    }
    let mut paths: Vec<&String> = Vec::with_capacity(number_of_routes);
    let mut ports = Vec::with_capacity(number_of_routes);
    for version in &config_yaml.versions {
        for route in &version.routes {
            paths.push(&route.path);

            for endpoint in &route.endpoints {
                if endpoint.cached && endpoint.expiration_time_seconds.is_none() {
                    panic!(
                        "an expiration date needs to be set at {} (caching is on)",
                        &route.path
                    );
                }
            }

            if route.auth.auth_required && route.auth.authorized_roles.len() == 0 {
                panic!(
                    "authorization is activated at {}, but there are no authorized roles set!",
                    &route.path
                );
            }

            for address in &route.service_addresses {
                let parts: Vec<&str> = address.split(':').collect();
                if parts.len() != 2 {
                    panic!("invalid address format: {}", address);
                }

                let port = parts[1];
                ports.push(port);
            }
        }
    }

    if !all_elements_unique(paths) {
        panic!("there are services with the same paths!");
    }

    if !all_elements_unique(ports) {
        panic!("there are services with the same ports!");
    }

    return;
}
