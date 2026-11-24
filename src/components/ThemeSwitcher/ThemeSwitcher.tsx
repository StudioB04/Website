import { useId } from "react";
import { Button } from "@studio_b04/ds/uikit";
import { useI18n } from "@/i18n";
import { themes, useTheme, type Theme } from "@/theme";

const icons: Record<Theme, string> = { light: "sun", dark: "moon", system: "monitor" };

export default function ThemeSwitcher() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const titleId = useId();

  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-md">
      <p id={titleId} className="text-sm font-semibold">
        {t("common.settings.theme.title")}
      </p>

      <div className="flex flex-wrap gap-sm">
        {themes.map(value => (
          <Button
            key={value}
            label={t(`common.settings.theme.${value}`)}
            iconStart={icons[value]}
            shape="pill"
            size="sm"
            variant={value === theme ? "brand" : "neutral"}
            aria-pressed={value === theme}
            onClick={() => setTheme(value)}
          />
        ))}
      </div>
    </div>
  );
}
