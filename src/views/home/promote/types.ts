export interface PromoteRule {
  id: number;
  validMemberCount: number;
  performanceAmount: number;
  commissionRate: number;
  commissionAmount?: number;
  commissionDescription?: string;
}

export interface PromoteRuleGroup {
  key: string;
  name: string;
  rules: PromoteRule[];
}

export interface PromoteInfo {
  user?: {
    account: string;
    inviteCode: string;
  } | null;
  config: {
    agentMode: number;
    agentModeName: string;
    auditMultiplier: number;
    settlementCycle: number;
    settlementCycleName: string;
    nextSettlementTimestamp: number;
    validMemberRechargeAmount: number;
    validMemberBetAmount: number;
    highestCommissionRate: number;
  };
  ruleGroups: PromoteRuleGroup[];
  inviteLinks: string[];
}
