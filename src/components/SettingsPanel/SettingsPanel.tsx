import { Dialog } from "@studio_b04/ds/uikit";
import { useI18n } from "@/i18n";

export default function SettingsPanel() {
  const { t } = useI18n();

  return (
    <Dialog id="options" position="start" title={t("common.settings.title")}>
      lorem
    </Dialog>
  );
}
