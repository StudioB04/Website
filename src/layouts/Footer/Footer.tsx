import AppLink from "@/components/AppLink/AppLink";
import { useI18n } from "@/i18n";
import "./Footer.css";
import { getPath } from "@/router";

export default function Footer() {
  const { locale, t } = useI18n();

  return (
    <div className="footer">
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium ipsam, amet quis id cumque ab vitae quasi veniam libero? Laboriosam impedit sint non
      odio temporibus, quisquam, et repudiandae qui accusamus, nemo perferendis nostrum voluptatem aut. Atque quam quas a repudiandae dolorum molestiae soluta
      deleniti repellat, qui nisi labore nam est, similique aperiam nesciunt harum laboriosam repellendus ipsa quaerat voluptas. Corporis rem aperiam quas eius,
      id exercitationem quibusdam. Consectetur illo in aut excepturi vero? Nisi harum saepe reprehenderit sunt magni! Debitis temporibus tenetur perferendis
      molestiae doloribus atque fuga eius ducimus aliquid, culpa molestias architecto labore commodi cum quibusdam earum reiciendis sunt!
      <AppLink to={getPath("legal", locale)} label={t("pages.legal.link")} />
    </div>
  );
}
