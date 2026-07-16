export type ArtifactClaim = {
  id: string;
  sourceId: string;
  text: string;
  locator: string;
};

export function claimsForArtifact(claimIds: readonly string[], claims: readonly ArtifactClaim[]) {
  const byId = new Map(claims.map((claim) => [claim.id, claim]));
  return [...new Set(claimIds)].flatMap((claimId) => {
    const claim = byId.get(claimId);
    return claim ? [claim] : [];
  });
}
