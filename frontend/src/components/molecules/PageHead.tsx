import { ReactNode } from "react";

interface Props {
  label: string;
  title: string;
  desc?: string;
  actions?: ReactNode;
}

export default function PageHead({ label, title, desc, actions }: Props) {
  return (
    <header className="items-center flex flex-wrap gap-y-16 gap-x-24 justify-between pt-16 px-0 pb-4">
      <div>
        <p className="text-[1.25rem] tracking-[0.06em] text-dim uppercase [&_code]:font-code [&_code]:tracking-[0]">{label}</p>
        <h1 className="text-[3.6rem] font-[320] tracking-[-0.035em] leading-[1.05] mt-6 max-w-800 md:text-[4.4rem]">{title}</h1>
        {desc && <p className="text-[1.6rem] leading-[1.5] mt-8 max-w-700 text-dim">{desc}</p>}
      </div>
      {actions && <div className="items-center flex flex-wrap gap-10">{actions}</div>}
    </header>
  );
}
