export type PaymentMethodApi =
    | "Cash"
    | "Card"
    | "BankTransfer"
    | "Check"
    | "DigitalWallet"
    | "Other"
    | number

const LABELS: Record<string, string> = {
    Cash: "Cash",
    Card: "Card",
    BankTransfer: "Bank transfer",
    Check: "Check",
    DigitalWallet: "Digital wallet",
    Other: "Other",
    "0": "Cash",
    "1": "Card",
    "2": "Bank transfer",
    "3": "Check",
    "4": "Digital wallet",
    "99": "Other",
}

export function formatPaymentMethod(method: PaymentMethodApi | string): string {
    if (typeof method === "number") {
        return LABELS[String(method)] ?? `Method ${method}`
    }
    return LABELS[method] ?? String(method)
}
