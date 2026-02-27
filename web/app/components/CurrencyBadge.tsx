import Image from "next/image";

interface CurrencyBadgeProps {
    countryCode: string;
    code: string;
    accountCount: number;
}

export default function CurrencyBadge({ countryCode, code, accountCount }: CurrencyBadgeProps) {
    return (
        <div className="flex flex-col items-center gap-2 border border-gray-200 rounded-2xl px-5 py-3.5 min-w-[90px] bg-white cursor-default transition-all duration-150 hover:border-[#D4A843] hover:shadow-[0_0_0_3px_rgba(212,168,67,0.10)]">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-100 relative">
                <Image
                    src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                    alt={code}
                    width={80}
                    height={60}
                    className="w-full h-full object-cover object-center"
                    unoptimized
                />
            </div>
            <span className="font-bold text-sm text-gray-900">{code}</span>
            <span className="text-[11px] text-gray-500">
                {accountCount} Account{accountCount !== 1 ? "s" : ""}
            </span>
        </div>
    );
}
