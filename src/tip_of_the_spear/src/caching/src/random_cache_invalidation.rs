use chrono::{Duration, NaiveDateTime, Utc};
use rand::random;

// you can finetune the curve with k
// here is the geogebra copy paste f(x) = (exp(k * x) - 1)/(exp(k) - 1)
const K: f64 = 25.0;

pub fn random_cache_invalidation(deadline: NaiveDateTime, cache_exiration_time: u64) -> bool {
    let now = Utc::now().naive_utc();
    let start = deadline - Duration::seconds(cache_exiration_time as i64);

    if now >= deadline {
        return true;
    }

    if now <= start {
        return false;
    }

    let elapsed = (now - start).num_milliseconds() as f64;
    let total = (deadline - start).num_milliseconds() as f64;
    let x = elapsed / total;

    let prob = if K.abs() < 1e-6 {
        x // k ≈ 0 => linear
    } else {
        (f64::exp(K * x) - 1.0) / (f64::exp(K) - 1.0)
    };

    // warn!("probability {}", &prob);
    random::<f64>() < prob
}
