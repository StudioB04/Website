import { Link } from "@studio_b04/ds/uikit";
import { useLinkClickHandler } from "react-router";
import type { ComponentProps, MouseEvent } from "react";

export interface AppLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  to: string;
}

export default function AppLink({ to, onClick, ...restProps }: AppLinkProps) {
  const handleClick = useLinkClickHandler<HTMLElement>(to);

  return (
    <Link
      href={to}
      onClick={(event: MouseEvent<HTMLButtonElement & HTMLLinkElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) handleClick(event);
      }}
      {...restProps}
    />
  );
}
