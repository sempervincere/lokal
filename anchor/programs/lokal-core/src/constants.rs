use anchor_lang::prelude::*;

pub const SEED_CLUSTER: &[u8] = b"cluster";
pub const MAX_SLUG_LEN: usize = 64;
pub const MAX_NAME_LEN: usize = 128;
pub const MAX_FIELD_CODE_LEN: usize = 8;
pub const MAX_FIELD_HASH_LEN: usize = 64; // SHA-256 hex = 64 chars
