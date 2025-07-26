use rand::{Rng, distributions::Alphanumeric};

pub fn rand_string(len: usize) -> String {
    let random_string: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect();

    random_string
}
