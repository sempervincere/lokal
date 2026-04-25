use anchor_lang::prelude::*;
use crate::{constants::*, error::LokalError, state::ClusterRecord};

pub fn handler(
    ctx: Context<InitializeCluster>,
    slug: String,
    name: String,
) -> Result<()> {
    require!(slug.len() <= MAX_SLUG_LEN, LokalError::SlugTooLong);

    let record = &mut ctx.accounts.cluster_record;
    record.cluster_slug = slug;
    record.cluster_name = name;
    record.authority = ctx.accounts.authority.key();
    record.validated_field_count = 0;
    record.created_at = Clock::get()?.unix_timestamp;

    msg!(
        "Cluster initialized: {} | authority: {}",
        record.cluster_slug,
        record.authority
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct InitializeCluster<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ClusterRecord::INIT_SPACE,
        seeds = [SEED_CLUSTER, slug.as_bytes()],
        bump,
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
