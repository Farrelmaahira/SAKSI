import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import type { NavItem } from "@/interfaces/dash";
import { isNavOn } from "@/lib/dash/is-nav-on";

interface Props {
  items: NavItem[];
  path: string;
  collapsed: boolean;
}

/* The menu of the dashboard: one link per page, the current one highlighted, with badges and notes */
export default function SidebarNav({ items, path, collapsed }: Props) {
  return (
    <nav className="grid gap-3 [&_a]:items-center [&_a]:rounded-[3rem] [&_a]:flex [&_a]:text-[1.5rem] [&_a]:gap-12 [&_a]:min-h-46 [&_a]:py-0 [&_a]:px-16 [&_a]:[transition:background_0.2s,_color_0.2s] [&_a:hover]:bg-deep [&_a_span]:flex-1 lg:[.is-collapsed_&_a_span]:hidden lg:[.is-collapsed_&]:justify-items-center lg:[.is-collapsed_&]:w-full lg:[.is-collapsed_&_a]:justify-center lg:[.is-collapsed_&_a]:p-0 lg:[.is-collapsed_&_a]:relative lg:[.is-collapsed_&_a]:w-46 app-nav">
      {items.map((i) => {
        const on = isNavOn(i, path);
        return (
          <Link
            key={i.to}
            href={i.to}
            className={
              on
                ? "[.app-nav_a&]:bg-white [.app-nav_a&]:[box-shadow:0.4rem_0.4rem_0_var(--color-ink)] [.app-nav_a&]:text-blue is-active"
                : ""
            }
            aria-current={on ? "page" : undefined}
            title={collapsed ? i.label : undefined}
          >
            <Icon name={i.icon} />
            <span>{i.label}</span>
            {Boolean(i.badge) && (
              <em className="bg-red rounded-[2rem] text-white text-[1.2rem] not-italic leading-[2.2rem] min-w-22 py-0 px-7 text-center lg:[.is-collapsed_&]:text-[1rem] lg:[.is-collapsed_&]:leading-[1.7rem] lg:[.is-collapsed_&]:min-w-17 lg:[.is-collapsed_&]:py-0 lg:[.is-collapsed_&]:px-4 lg:[.is-collapsed_&]:absolute lg:[.is-collapsed_&]:-right-4 lg:[.is-collapsed_&]:-top-2">
                {i.badge}
              </em>
            )}
            {i.note && (
              <em className="border-[0.1rem] border-current border-solid rounded-[2rem] text-[1.05rem] not-italic tracking-[0.04em] py-1 px-8 uppercase lg:[.is-collapsed_&]:hidden">
                {i.note}
              </em>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
