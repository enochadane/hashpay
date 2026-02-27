interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export default function SearchBar({
    placeholder = "Search a name or an email",
    value,
    onChange,
}: SearchBarProps) {
    return (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 w-70 shadow-sm">
            <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#9ca3af" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="border-none outline-none text-[13px] text-gray-700 bg-transparent w-full placeholder:text-gray-400"
            />
        </div>
    );
}
