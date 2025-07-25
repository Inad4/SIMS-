use std::fs;

use crate::{
    CONFIG_YAML_PATH, config_yaml::ConfigYaml, create_new_yaml::create_new_yaml,
    insure_config_yaml_is_correct::insure_config_yaml_is_correct,
};

impl ConfigYaml {
    pub fn init() -> Self {
        if !fs::metadata(CONFIG_YAML_PATH).is_ok() {
            log::error!("config.yaml does not exist");
            create_new_yaml();
            panic!(
                "config.yaml was missing and has now been created. Please fill it in and restart."
            );
        }

        let config_yaml_file_string = match fs::read_to_string(CONFIG_YAML_PATH) {
            Ok(e) => e,
            Err(e) => {
                log::error!("Failed to read config.yaml: {}", e);
                panic!();
            }
        };

        let config_yaml = serde_yaml::from_str(&config_yaml_file_string);
        let config_yaml: ConfigYaml = match config_yaml {
            Ok(e) => e,
            Err(e) => {
                log::error!("config.yaml is in an invalid format: {}", e);
                panic!();
            }
        };

        insure_config_yaml_is_correct(&config_yaml);

        return config_yaml;
    }
}
