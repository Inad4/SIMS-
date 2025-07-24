use config_yaml::config_yaml::Endpoint;

pub fn is_caching_enabled(endpoint_yaml_data: &Option<Endpoint>) -> (bool, u64) {
    let endpoint_yaml_data = match endpoint_yaml_data {
        Some(e) => e,
        None => return (false, 0),
    };

    let expiration_time_seconds = match endpoint_yaml_data.expiration_time_seconds {
        Some(e) => e,
        None => 0,
    };

    (endpoint_yaml_data.cached, expiration_time_seconds)
}
