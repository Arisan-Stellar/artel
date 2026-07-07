export const DEFAULT_COLLATERAL_MULTIPLIER = 125;

export function getRemainingCommitmentCycles(maxParticipants: number): number {
  return Math.max(0, maxParticipants - 1);
}

export function getRequiredCollateralAmount(
  depositAmount: number,
  maxParticipants: number,
  collateralMultiplier = DEFAULT_COLLATERAL_MULTIPLIER,
): number {
  return Math.ceil(
    depositAmount * getRemainingCommitmentCycles(maxParticipants) * collateralMultiplier / 100,
  );
}

export interface PoolConfigLike {
  contribution_amount?: string | number;
  max_members?: number;
  collateral_ratio_bps?: number;
}

export function getRequiredCollateralFromConfig(config: PoolConfigLike): number {
  const contributionStroops = Number(config.contribution_amount || 0);
  const members = Number(config.max_members || 0);
  const bps = Number(config.collateral_ratio_bps || 12500);
  const collateralStroops = Math.floor(
    contributionStroops * getRemainingCommitmentCycles(members) * bps / 10000,
  );
  return collateralStroops / 10_000_000;
}
