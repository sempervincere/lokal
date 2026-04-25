use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ClusterRecord {
    #[max_len(64)]
    pub cluster_slug: String,
    #[max_len(128)]
    pub cluster_name: String,
    pub authority: Pubkey,
    pub validated_field_count: u32,
    pub created_at: i64,
}
