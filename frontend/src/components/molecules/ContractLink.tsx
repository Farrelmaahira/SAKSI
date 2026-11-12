import Link from "next/link";

interface Props {
  href: string;
  code: string;
  title: string;
  /* a small line under the title */
  sub?: string;
}

export default function ContractLink({ href, code, title, sub }: Props) {
  return (
    <Link
      href={href}
      className="grid gap-2 min-w-220 [&_code]:text-[1.2rem] [&_code]:text-dim [&_strong]:font-[420] [&_strong]:[transition:color_0.2s] [&:hover_strong]:text-blue [&_small]:text-[1.25rem] [&_small]:text-dim max-md:min-w-0 d-row-link"
    >
      <code>{code}</code>
      <strong>{title}</strong>
      {sub && <small>{sub}</small>}
    </Link>
  );
}
