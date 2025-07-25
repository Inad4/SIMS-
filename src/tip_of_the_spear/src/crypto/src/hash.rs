use argon2::{
    Algorithm, Argon2, Version,
    password_hash::{Error, PasswordHasher, SaltString, rand_core::OsRng},
};

use env::env;

pub async fn hash(input: &String) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, env::ARGON2_PARAMS?);

    let password_hash = argon2.hash_password(input.as_bytes(), &salt)?.to_string();

    Ok(password_hash)
}
