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
    crossLevelRate: number;
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

export interface PromoteCommissionRecord {
  id: number;
  settlementDate: string;
  subordinateCount: number;
  validSubordinateCount: number;
  performance: number;
  directCommission: number;
  otherCommission: number;
  commission: number;
  receivedCommission: number;
  status: 1 | 2 | 3;
  canReceive: boolean;
  receiveTime: number;
}

export interface PromoteCommissionParams {
  size: number;
  startTime: number;
  endTime: number;
  cursorId?: number;
}

export interface PromoteCommissionResponse {
  list: PromoteCommissionRecord[];
  pageSize: number;
  more: boolean;
  nextCursorId: number | null;
  startTime: number;
  endTime: number;
}

export interface PromotePerformanceRecord {
  id: number;
  statisticDate: string;
  totalPerformance: number;
  directPerformance: number;
  otherPerformance: number;
  totalContribute: number;
  directContribute: number;
  otherContribute: number;
}

export interface PromotePerformanceParams {
  size: number;
  startTime: number;
  endTime: number;
  cursorId?: number;
}

export interface PromotePerformanceResponse {
  list: PromotePerformanceRecord[];
  pageSize: number;
  more: boolean;
  nextCursorId: number | null;
  startTime: number;
  endTime: number;
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
  validBetCount?: number;
  profitLose?: number;
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
  directProfitLose?: number;
  otherProfitLose?: number;
  totalProfitLose?: number;
  directRegisterPerson: number;
  otherRegisterPerson: number;
  totalRegisterPerson: number;
  startTime: number;
  endTime: number;
}

export interface PromoteSubordinateFinance {
  userIdx: number;
  vipLevel: number;
  directChildCount: number;
  deposit: number;
  depositCount: number;
  withdraw: number;
  withdrawCount: number;
  difference: number;
  balance: number;
}

export interface PromoteSubordinateFinanceParams {
  size: number;
  sortOrder: 1 | 2;
  startTime: number;
  endTime: number;
  userIdx?: number;
  cursorValue?: number;
  cursorMemberId?: number;
}

export interface PromoteSubordinateFinanceResponse {
  list: PromoteSubordinateFinance[];
  pageSize: number;
  more: boolean;
  nextCursorValue: number | null;
  nextCursorMemberId: number | null;
  totalDeposit: number;
  totalDepositCount: number;
  totalFirstDeposit: number;
  totalFirstDepositPerson: number;
  totalWithdraw: number;
  totalWithdrawCount: number;
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

export interface PromoteBettingDetailItem {
  type: number;
  typeName: string;
  apiCode: string;
  playType: string;
  validBetAmount: number;
  netAmount: number;
  betCount: number;
}

export interface PromoteBettingDetailResponse {
  list: PromoteBettingDetailItem[];
  gameTypes: Array<{
    label: string;
    value: number;
  }>;
  summary: {
    totalBetCount: number;
    totalValidBetAmount: number;
    totalNetAmount: number;
  };
  page: number;
  pageSize: number;
  total: number;
  more: boolean;
  startTime: number;
  endTime: number;
}

export interface PromoteSubordinateReceiveOtherCoupon {
  otherName: string;
  otherAmount: number;
}

export interface PromoteSubordinateReceive {
  userIdx: number;
  account: string;
  encryption: string;
  vipLevel: number;
  directChildCount: number;
  activityReward: number;
  returnGold: number;
  taskReward: number;
  agentCommission: number;
  totalOther: number;
  totalReward: number;
  otherCoupons: PromoteSubordinateReceiveOtherCoupon[];
}

export interface PromoteSubordinateReceiveResponse {
  list: PromoteSubordinateReceive[];
  totalRecords: number;
  total: number;
  page: number;
  pageSize: number;
  more: boolean;
  totalActivityReward: number;
  totalReturnGold: number;
  totalTaskReward: number;
  totalAgentCommission: number;
  totalOther: number;
  totalValue: number;
  startTime: number;
  endTime: number;
}

export interface PromoteDataResponse {
  timeNewAddTotalMember: number;
  timeNewAddDirectMember: number;
  timeNewAddOtherMember: number;
  timeTotalDeposit: number;
  timeDirectDeposit: number;
  timeOtherDeposit: number;
  timeTotalDepositPerson: number;
  timeDirectDepositPerson: number;
  timeOtherDepositPerson: number;
  timeTotalFirstDeposit: number;
  timeDirectFirstDeposit: number;
  timeOtherFirstDeposit: number;
  timeTotalFirstDepositPerson: number;
  timeDirectFirstDepositPerson: number;
  timeOtherFirstDepositPerson: number;
  timeTotalRegisterDeposit: number;
  timeDirectRegisterDeposit: number;
  timeOtherRegisterDeposit: number;
  timeTotalRegisterDepositPerson: number;
  timeDirectRegisterDepositPerson: number;
  timeOtherRegisterDepositPerson: number;
  timeTotalWithdraw: number;
  timeDirectWithdraw: number;
  timeOtherWithdraw: number;
  timeTotalWithdrawPerson: number;
  timeDirectWithdrawPerson: number;
  timeOtherWithdrawPerson: number;
  timeTotalDiscount: number;
  timeDirectDiscount: number;
  timeOtherDiscount: number;
  timeTotalDiscountPerson: number;
  timeDirectDiscountPerson: number;
  timeOtherDiscountPerson: number;
  timeTotalValidBet: number;
  timeDirectValidBet: number;
  timeOtherValidBet: number;
  timeTotalValidBetPerson: number;
  timeDirectValidBetPerson: number;
  timeOtherValidBetPerson: number;
  timeTotalProfitLose: number;
  timeDirectProfitLose: number;
  timeOtherProfitLose: number;
  timeTotalProfitLosePerson: number;
  timeDirectProfitLosePerson: number;
  timeOtherProfitLosePerson: number;
  timeTotalPerformance: number;
  timeDirectPerformance: number;
  timeOtherPerformance: number;
  timeTotalContribute: number;
  timeDirectContribute: number;
  timeOtherContribute: number;
  timeReceiveCommission: number;
  timeCommission: number;
  timeDirectCommission: number;
  timeOtherCommission: number;
  timePromoteActiveAmount: number;
  timeAgentActiveAmount: number;
  totalMember: number;
  directMember: number;
  otherMember: number;
  totalPerformance: number;
  directPerformance: number;
  otherPerformance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalDiscount: number;
  totalValidBet: number;
  totalProfitLose: number;
  totalCommission: number;
  directCommission: number;
  otherCommission: number;
  sumCommission: number;
  canTakeCommission: number;
  takenCommission: number;
  promoteActiveAmount: number;
  agentActiveAmount: number;
  isTopAgent: boolean;
}
