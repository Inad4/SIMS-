use config_yaml::config_yaml::{Endpoint, Route};
use error::error::Error;

pub fn endpoint_allowed(
    yaml_route: &Route,
    endpoint_yaml_data: &Option<Endpoint>,
) -> Result<(), Error> {
    let is_strict = match yaml_route.strict_mode {
        Some(e) => e,
        None => false,
    };
    if !is_strict {
        return Ok(());
    }

    if !endpoint_yaml_data.is_none() {
        return Ok(());
    }

    return Err(Error::NotFound());
}
