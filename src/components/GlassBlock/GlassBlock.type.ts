import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface GlassBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: ElementType;
}
