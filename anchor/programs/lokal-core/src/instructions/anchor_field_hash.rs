use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke,
    pubkey,
};
use crate::{constants::*, error::LokalError, state::ClusterRecord};

// Hardcoded Memo program ID — stable, never changes on any Solana cluster
const MEMO_PROGRAM_ID: Pubkey = pubkey!("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

fn build_memo_ix(memo: &str) -> Instruction {
    Instruction {
        program_id: MEMO_PROGRAM_ID,
        accounts: vec![],
        data: memo.as_bytes().to_vec(),
    }
}

pub fn handler(
    ctx: Context<AnchorFieldHash>,
    _slug: String,
    field_code: String,
    field_hash: String,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.cluster_record.authority,
        LokalError::Unauthorized
    );
    require!(field_code.len() <= MAX_FIELD_CODE_LEN, LokalError::FieldCodeTooLong);
    require!(field_hash.len() == MAX_FIELD_HASH_LEN, LokalError::InvalidFieldHash);

    let record = &mut ctx.accounts.cluster_record;
    let timestamp = Clock::get()?.unix_timestamp;

    // Format: LOKAL|<slug>|<field_code>|<field_hash>|<timestamp>
    // This is the on-chain proof point visible on Solana Explorer
    let memo = format!(
        "LOKAL|{}|{}|{}|{}",
        record.cluster_slug, field_code, field_hash, timestamp
    );

    // CPI to SPL Memo program — writes memo into transaction logs
    let memo_ix = build_memo_ix(&memo);
    invoke(&memo_ix, &[])?;

    // Increment counter with overflow guard
    record.validated_field_count = record
        .validated_field_count
        .checked_add(1)
        .unwrap_or(record.validated_field_count);

    msg!("Field anchored: {} | count: {}", field_code, record.validated_field_count);
    Ok(())
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct AnchorFieldHash<'info> {
    #[account(
        mut,
        seeds = [SEED_CLUSTER, slug.as_bytes()],
        bump,
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    pub authority: Signer<'info>,
}
