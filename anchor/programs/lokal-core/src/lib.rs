pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ");

#[program]
pub mod lokal_core {
    use super::*;

    pub fn initialize_cluster(
        ctx: Context<InitializeCluster>,
        slug: String,
        name: String,
    ) -> Result<()> {
        instructions::initialize_cluster::handler(ctx, slug, name)
    }

    pub fn anchor_field_hash(
        ctx: Context<AnchorFieldHash>,
        slug: String,
        field_code: String,
        field_hash: String,
    ) -> Result<()> {
        instructions::anchor_field_hash::handler(ctx, slug, field_code, field_hash)
    }
}
