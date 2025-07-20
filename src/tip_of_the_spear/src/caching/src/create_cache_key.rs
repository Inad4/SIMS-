use auth::api_gateway_authorize::AccountData;

pub fn create_cache_key(full_url: &String, account_data: &Option<AccountData>) -> String {
    let account_data = match account_data {
        Some(e) => e,
        None => &AccountData {
            bearer_token: "None".into(),
            x_user_id: "None".into(),
            x_roles: Vec::new(),
        },
    };
    format!(
        "{}:{}:{}",
        full_url,
        account_data.x_user_id,
        account_data.x_roles.join(",")
    )
}
