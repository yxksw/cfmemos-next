import { siteConfig } from "@/config/site";

export default function Cover() {
  const { author } = siteConfig;

  return (
    <div className="relative w-full h-[320px] overflow-hidden">
      {/* 背景图 */}
      <img
        src={author.background}
        alt="背景图"
        className="w-full h-full object-cover"
      />
      
      {/* 博主信息 */}
      <div className="absolute bottom-2.5 right-5 flex items-end gap-2.5">
        <div className="text-white text-lg font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {author.name}
        </div>
        <div className="w-[50px] h-[50px] rounded-sm border-2 border-white shadow-md overflow-hidden">
          <img
            src={author.avatar}
            alt="头像"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
