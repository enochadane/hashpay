export type Status = "Approved" | "Pending";

interface StatusBadgeProps {
    status: Status;
}

const variantClasses: Record<Status, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-600",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`${variantClasses[status]} inline-block rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap`}>
            {status}
        </span>
    );
}
