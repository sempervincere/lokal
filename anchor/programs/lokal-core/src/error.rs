use anchor_lang::prelude::*;

#[error_code]
pub enum LokalError {
    #[msg("Only the cluster authority can anchor field hashes")]
    Unauthorized,
    #[msg("Slug exceeds maximum length")]
    SlugTooLong,
    #[msg("Field code exceeds maximum length")]
    FieldCodeTooLong,
    #[msg("Field hash must be a 64-character SHA-256 hex string")]
    InvalidFieldHash,
}
