import clsx from "clsx";
import type { GlassBlockProps } from "./GlassBlock.type";

import "./GlassBlock.css";

export default function GlassBlock({ children, as, className, ...props }: GlassBlockProps) {
  const Component = as || "div";

  return (
    <Component className={clsx("glass-block", className)} {...props}>
      {children}
    </Component>
  );
}
