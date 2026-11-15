import { useI18n } from "@/i18n";

export default function SkipLink({ target = "main" }: { target?: string }) {
  const { t } = useI18n();

  return (
    <a
      className="absolute top-2 left-2 z-50 -translate-y-[200%] rounded-md bg-(--ds-bg-inverse) px-3 py-2 text-(color:--ds-text-inverse) focus:translate-y-0"
      href={`#${target}`}
    >
      {t("common.skipToContent")}
    </a>
  );
}
