import { ReactNode } from "react";

interface Props {
  tone?: string;
  children: ReactNode;
}

const TONES: Record<string, string> = {
  muted:
    "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-gray text-white",
  outline:
    "items-center border-[0.1rem] border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! border-current",
  tint: "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-deep text-white",
  blue: "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-blue text-white",
  ink: "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-ink text-white",
  red: "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-red text-white",
  done: "items-center border-[0.1rem] border-transparent border-solid rounded-[2rem] inline-flex text-[1.2rem] gap-4 leading-[1.2] py-3.5 px-10 whitespace-nowrap [.d-timeline_li>&]:[justify-self:start] [.d-compare_li_&]:[justify-self:start]! [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:text-ink! bg-green text-white",
};

export default function Badge({ tone = "muted", children }: Props) {
  return <span className={TONES[tone]}>{children}</span>;
}
