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

export interface PromoteSubordinate {
  userIdx: number;
  vipLevel: number;
  account: string;
  encryption: string;
  lastLoginTime: number;
  status: number;
  online: number;
  directChildCount: number;
  deposit: number;
  validBet: number;
  isDeposit: number;
  regTime: number;
  loginTimes: number;
  direct: number;
}

export interface PromoteSubordinateResponse {
  list: PromoteSubordinate[];
  totalRecords: number;
  total: number;
  pageSize: number;
  more: boolean;
  totalFirstDeposit: number;
  totalFirstDepositPerson: number;
  totalDeposit: number;
  totalDepositPerson: number;
  directDeposit: number;
  directDepositPerson: number;
  otherDeposit: number;
  otherDepositPerson: number;
  directValidBet: number;
  otherValidBet: number;
  totalValidBet: number;
  directRegisterPerson: number;
  otherRegisterPerson: number;
  totalRegisterPerson: number;
  startTime: number;
  endTime: number;
}

export interface PromoteSubordinatePeriodData {
  deposit: number;
  withdraw: number;
  difference: number;
  discount: number;
  validBet: number;
  profit: number;
}

export interface PromoteSubordinateDetail {
  userIdx: number;
  account: string;
  encryption: string;
  vipLevel: number;
  status: number;
  online: number;
  loginTimes: number;
  lastLoginTime: number;
  regTime: number;
  today: PromoteSubordinatePeriodData;
  yesterday: PromoteSubordinatePeriodData;
  total: PromoteSubordinatePeriodData;
}
