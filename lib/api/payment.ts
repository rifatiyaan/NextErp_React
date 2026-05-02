import { fetchAPI } from "@/lib/api/client"
import type { RecordSalePaymentRequest } from "@/lib/types/payment"
import type { SalePaymentLine } from "@/lib/types/sale"

export const paymentAPI = {
    async listBySaleId(saleId: string, signal?: AbortSignal): Promise<SalePaymentLine[]> {
        return fetchAPI<SalePaymentLine[]>(`/api/Payment/sale/${saleId}`, { signal })
    },

    async recordSalePayment(
        body: RecordSalePaymentRequest
    ): Promise<{ id?: string } | SalePaymentLine | null> {
        return fetchAPI(`/api/Payment`, {
            method: "POST",
            body: JSON.stringify({
                saleId: body.saleId,
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                paidAt: body.paidAt ?? null,
                reference: body.reference ?? null,
            }),
        })
    },
}
