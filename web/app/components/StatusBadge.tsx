export type Status = "APPROVED" | "PENDING" | "Approved" | "Pending";

interface StatusBadgeProps {
    status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const normalized = status.toUpperCase();
    const isApproved = normalized === "APPROVED";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap border ${isApproved
                    ? "bg-gray-50 border-gray-200 text-emerald-600"
                    : "bg-gray-50 border-gray-200 text-amber-500"
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-500" : "bg-amber-400"
                    }`}
            />
            {isApproved ? "Approved" : "Pending"}
        </span>
    );
}
