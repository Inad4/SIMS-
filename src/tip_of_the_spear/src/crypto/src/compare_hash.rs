use argon2::{
    Algorithm, Argon2, Version,
    password_hash::{Error, PasswordHash, PasswordVerifier},
};

use env::env;

pub async fn compare_hash(input: &String, hash: &String) -> Result<bool, Error> {
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, env::ARGON2_PARAMS?);

    let parsed_hash = PasswordHash::new(hash)?;

    let is_correct = argon2
        .verify_password(input.as_bytes(), &parsed_hash)
        .is_ok();

    Ok(is_correct)
}
