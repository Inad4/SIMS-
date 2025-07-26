use std::{collections::HashMap, net::IpAddr, sync::Arc};

use tokio::sync::Mutex;

use crate::bucket::bucket::Bucket;

#[derive(Clone)]
pub struct LeakyBucketRateLimiter {
    pub buckets: Arc<Mutex<HashMap<IpAddr, Bucket>>>,
    pub capacity: u32,
    pub leak_rate: f64, // tokens per second
}

impl LeakyBucketRateLimiter {
    pub fn new(capacity: u32, leak_rate: f64) -> Self {
        LeakyBucketRateLimiter {
            buckets: Arc::new(Mutex::new(HashMap::new())),
            capacity,
            leak_rate,
        }
    }

    pub async fn check_rate_limit(&self, ip: IpAddr) -> bool {
        let mut buckets = self.buckets.lock().await;
        let bucket = buckets.entry(ip).or_insert(Bucket::new());
        if bucket.leak(self.leak_rate, self.capacity) {
            bucket.add(1, self.capacity)
        } else {
            false
        }
    }
}
