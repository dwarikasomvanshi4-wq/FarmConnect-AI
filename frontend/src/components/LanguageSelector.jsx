
import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2">
      <span>{t("language")}:</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </label>
  );
}
