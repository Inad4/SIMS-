use chrono::NaiveDateTime;
use error::error::Error;
use jsonwebtoken::DecodingKey;
use serde::Deserialize;

use crate::public_pem::public_key::PublicKey;

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct Res {
    status: String,
    data: TokenRes,
}

#[derive(Deserialize, Debug)]
struct TokenRes {
    public_pem: Vec<u8>,
    naive_expiration_date: NaiveDateTime,
}

pub async fn fetch_public_key(full_public_pem_url: &String) -> Result<PublicKey, Error> {
    let body = reqwest::get(full_public_pem_url)
        .await?
        .json::<Res>()
        .await?;

    let public_key = DecodingKey::from_rsa_pem(&body.data.public_pem)?;

    Ok(PublicKey {
        public_key,
        public_pem: body.data.public_pem,
        expiration: body.data.naive_expiration_date,
    })
}
