import { Link } from "@studio_b04/ds/uikit";
import { useHref, useLinkClickHandler } from "react-router";
import type { ComponentProps, MouseEvent } from "react";

export interface AppLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  to: string;
}

export default function AppLink({ to, onClick, ...restProps }: AppLinkProps) {
  const href = useHref(to);
  const handleClick = useLinkClickHandler<HTMLElement>(to);

  return (
    <Link
      href={href}
      onClick={(event: MouseEvent<HTMLButtonElement & HTMLLinkElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) handleClick(event);
      }}
      {...restProps}
    />
  );
}
