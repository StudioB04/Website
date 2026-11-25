import { Dialog, Icon } from "@studio_b04/ds/uikit";
import { useI18n } from "@/i18n";
import clsx from "clsx";
import LanguageButton from "../LanguageButton/LanguageButton";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";

export default function SettingsPanel() {
  const { t } = useI18n();

  return (
    <>
      <button
        className={clsx(
          "fixed inset-s-0 inset-be-5xl p-sm bg-secondary border border-primary rounded-e-xl shadow-md z-4 translate-x-[-30%] -rotate-3",
          "hover:translate-x-0 focus-visible:translate-x-0",
          "active:scale-95",
          "transition-transform duration-200",
        )}
        title={t("common.settings.title")}
        popoverTarget="options">
        <div className="sr-only">{t("common.settings.title")}</div>
        <Icon src="settings" size={24} />
      </button>

      <Dialog id="options" position="start" size="sm" title={t("common.settings.title")}>
        <div className="flex flex-col gap-2xl">
          <LanguageButton />
          <ThemeSwitcher />
        </div>
      </Dialog>
    </>
  );
}
