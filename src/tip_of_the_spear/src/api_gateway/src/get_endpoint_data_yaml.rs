use config_yaml::config_yaml::{Endpoint, Route};

pub fn get_endpoint_data_yaml(endpoint_tree: &[&str], yaml_route: &Route) -> Option<Endpoint> {
    for yaml_endpoint in &yaml_route.endpoints {
        let yaml_endpoint_tree: Vec<&str> = yaml_endpoint
            .endpoint_path
            .trim_start_matches('/')
            .split('/')
            .collect();

        let has_wildcard = yaml_endpoint_tree.last().map_or(false, |&seg| seg == "*");

        if !has_wildcard && yaml_endpoint_tree.len() != endpoint_tree.len() {
            continue;
        }

        if has_wildcard && endpoint_tree.len() < yaml_endpoint_tree.len() - 1 {
            continue;
        }

        let mut matched = true;
        for (i, &pat_seg) in yaml_endpoint_tree.iter().enumerate() {
            if pat_seg == "*" {
                break;
            }
            if let Some(&input_seg) = endpoint_tree.get(i) {
                if pat_seg.starts_with(':') {
                    continue;
                }

                if pat_seg != input_seg {
                    matched = false;
                    break;
                }
            } else {
                matched = false;
                break;
            }
        }

        if matched {
            return Some(yaml_endpoint.clone());
        }
    }

    None
}
