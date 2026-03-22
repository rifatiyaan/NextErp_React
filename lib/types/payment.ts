export type RecordSalePaymentMethod =
    | "Cash"
    | "Card"
    | "BankTransfer"
    | "Check"
    | "DigitalWallet"
    | "Other"

export interface RecordSalePaymentRequest {
    saleId: string
    amount: number
    paymentMethod: RecordSalePaymentMethod
    paidAt?: string | null
    reference?: string | null
}
