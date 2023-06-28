export type Plan = {
  id: number;
  title: string;
  requiredNodePower: string;
  verificationMethods: string;
  APR: string;
  profitability: string;
  backgroundColor: string;
  shadowColor: string;
};

export enum ActionType {
  CREATE = 'Create',
  UPGRADE = 'Upgrade',
  MERGE = 'Merge',
  SPLIT = 'Split',
  TRANSFER = 'Transfer',
}

export type SidebarItem = {
  id: number;
  title: string;
  icon: string;
  hoverIcon: string;
  link: ActionType;
};

export type BonALICE = {
  id: number;
  title: string;
  nodePower: string;
  tier: string;
};

export type UserWallet = {
  id: number;
  title: string;
  address: string;
  balance: string;
  verified: boolean;
};

export type RawRewards = {
  alice_operator: RawRewardSection;
  deus_presale: RawRewardSection;
  early_alice_operator: RawRewardSection;
  muon_presale: RawRewardSection;
};

type RawRewardSection = {
  contributors: string[];
  reward: number;
};

export type RewardWallet = {
  walletAddress: string;
  signature: string | null;
  wasInMuonPresale: boolean;
  wasInDeusPresale: boolean;
  wasAliceOperator: boolean;
  hasBeenProcessed: boolean;
};

export enum NotificationSources {
  ALLOWANCE = 'allowance',
}

export type Notification = {
  id: string;
  source: NotificationSources;
  hash: `0x${string}` | null;
  type: NotificationType;
  status: NotificationStatuses;
  message: string;
};

export enum NotificationStatuses {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}
export enum NotificationType {
  PROMISE = 'promise',
  PENDING = 'pending',
  TIMEOUT = 'timeout',
}
