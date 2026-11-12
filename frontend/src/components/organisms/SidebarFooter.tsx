import Link from "next/link";
import Icon from "@/components/atoms/Icon";

interface Props {
  collapsed: boolean;
  onReset: () => void;
}

/* Bottom of the sidebar: the public portal and "reset demo data" */
export default function SidebarFooter({ collapsed, onReset }: Props) {
  return (
    <div className="border-t-[0.1rem] border-t-[#3b64dc] [border-top-style:solid] grid gap-2 mt-auto pt-16 [&_a]:items-center [&_a]:[background:none] [&_a]:border-0 [&_a]:border-none [&_a]:rounded-[3rem] [&_a]:[color:inherit] [&_a]:flex [&_a]:text-[1.4rem] [&_a]:gap-12 [&_a]:min-h-42 [&_a]:py-0 [&_a]:px-16 [&_a]:text-left [&_a]:[transition:background_0.2s] [&_button]:items-center! [&_button]:[background:none]! [&_button]:border-0! [&_button]:border-none! [&_button]:rounded-[3rem]! [&_button]:[color:inherit]! [&_button]:flex [&_button]:text-[1.4rem]! [&_button]:gap-12! [&_button]:min-h-42! [&_button]:py-0 [&_button]:px-16 [&_button]:text-left! [&_button]:[transition:background_0.2s]! [&_a:hover]:bg-deep [&_button:hover]:bg-deep! lg:[.is-collapsed_&_span]:hidden lg:[.is-collapsed_&]:justify-items-center lg:[.is-collapsed_&]:w-full lg:[.is-collapsed_&_a]:justify-center lg:[.is-collapsed_&_a]:p-0 lg:[.is-collapsed_&_a]:relative lg:[.is-collapsed_&_a]:w-46 lg:[.is-collapsed_&_button]:justify-center! lg:[.is-collapsed_&_button]:p-0 lg:[.is-collapsed_&_button]:relative! lg:[.is-collapsed_&_button]:w-46!">
      <Link href="/lacak" title={collapsed ? "Portal publik" : undefined}>
        <Icon name="globe" />
        <span>Portal publik</span>
      </Link>
      <button
        type="button"
        onClick={onReset}
        title={collapsed ? "Reset data demo" : undefined}
      >
        <Icon name="refresh" />
        <span>Reset data demo</span>
      </button>
    </div>
  );
}
