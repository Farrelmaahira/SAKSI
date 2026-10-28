export interface SimStep {
  title: string;
  short: string;
  guide: string;
  why: string;
}

export interface ContractTypeOption {
  id: string;
  note: string;
}

export interface SimClause {
  id: string;
  title: string;
  text: string;
  why: string;
}

export interface Distractor {
  id: string;
  title: string;
  reason: string;
}

export type SignKey = "kades" | "meterai" | "penyedia";

export interface SignItem {
  id: string;
  key: SignKey;
  zone: string;
  label: string;
}

export type SignedState = Record<SignKey, boolean>;
