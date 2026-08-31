import type { PropsWithChildren, ReactNode } from "react";

interface CardProps extends PropsWithChildren {
  eyebrow?: string;
  title: ReactNode;
}

export function Card({ children, eyebrow, title }: CardProps) {
  return (
    <section className="q-card">
      <header className="q-card__header">
        {eyebrow ? <p className="q-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </header>
      <div className="q-card__content">{children}</div>
    </section>
  );
}
