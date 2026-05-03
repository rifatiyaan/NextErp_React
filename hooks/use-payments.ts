"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { paymentAPI } from "@/lib/api/payment"
import { paymentQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { RecordSalePaymentRequest } from "@/lib/types/payment"


// ----- Reads -----

export function useSalePayments(saleId: string | undefined) {
    return useQuery(paymentQueries.bySale(saleId))
}

// ----- Mutations -----

export function useRecordSalePayment() {
    return useMutation({
        mutationFn: (input: RecordSalePaymentRequest) => paymentAPI.recordSalePayment(input),
        meta: {
            successMessage: "Payment recorded",
            invalidates: [queryKeys.payments.all, queryKeys.sales.all],
        },
    })
}
