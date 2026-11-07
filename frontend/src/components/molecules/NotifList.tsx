"use client";

import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import type { Notif } from "@/interfaces/notifications";
import { when } from "@/lib/dash/when";
import { markRead } from "@/lib/notifications/mark-read";

interface Props {
  items: Notif[];
  read: string[];
  userId: string;
}

/* Same row design as the "Perlu tindakan" lists on the other dashboards */
export default function NotifList({ items, read, userId }: Props) {
  return (
    <ul className="d-todo">
      {items.map((n) => {
        const isNew = !read.includes(n.id);
        return (
          <li key={n.id}>
            <Link
              href={n.to}
              className={`tone-${n.tone} ${isNew ? "is-new" : ""}`}
              onClick={() => markRead(userId, [n.id])}
            >
              <span className="d-todo-mark" aria-hidden="true">
                <Icon
                  name={
                    n.tone === "red"
                      ? "alert"
                      : n.tone === "blue"
                        ? "check"
                        : "clock"
                  }
                />
              </span>
              <span className="d-todo-body">
                <strong>{n.title}</strong>
                <small>{n.text}</small>
              </span>
              <span className="d-todo-when">
                {isNew && (
                  <i className="d-todo-dot" aria-label="Belum dibaca" />
                )}
                {when(n.at)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
