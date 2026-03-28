import { siteConfig } from "@/config/site";
import { Rss } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-2.5 px-4 text-gray-500 dark:text-gray-400 text-sm flex justify-between items-center border-t border-gray-100 dark:border-gray-700 mt-5">
      <span>Copyright © 2026 Powered by 异飨客</span>
      <div className="flex items-center gap-4">
        <a
          href="/rss.xml"
          title="RSS 订阅"
          className="text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Rss className="w-4 h-4" />
          RSS
        </a>
        <span className="text-[#07c160]">
          <a
            href="https://xgk.pw"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            XGK
          </a>
        </span>
      </div>
    </footer>
  );
}
