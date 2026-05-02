"use client"

import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRecordSalePayment } from "@/hooks/use-payments"
import type { RecordSalePaymentMethod } from "@/lib/types/payment"

const METHOD_OPTIONS: { value: RecordSalePaymentMethod; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "BankTransfer", label: "Bank transfer" },
    { value: "Check", label: "Check" },
    { value: "DigitalWallet", label: "Digital wallet" },
    { value: "Other", label: "Other" },
]

interface RecordPaymentValues {
    amount: number
    paymentMethod: RecordSalePaymentMethod
    reference: string
}

interface RecordPaymentFormProps {
    saleId: string
    balanceDue: number
    onRecorded: () => Promise<void>
}

export function RecordPaymentForm({
    saleId,
    balanceDue,
    onRecorded,
}: RecordPaymentFormProps) {
    const form = useForm<RecordPaymentValues>({
        defaultValues: {
            amount: balanceDue > 0 ? balanceDue : 0,
            paymentMethod: "Cash",
            reference: "",
        },
    })

    useEffect(() => {
        if (balanceDue > 0) {
            form.setValue("amount", balanceDue)
        }
    }, [balanceDue, form])

    const recordPayment = useRecordSalePayment()
    const submitting = recordPayment.isPending

    const onSubmit = form.handleSubmit((values) => {
        if (!Number.isFinite(values.amount) || values.amount <= 0) {
            toast.error("Enter a valid amount greater than zero")
            return
        }
        if (values.amount > balanceDue + 0.0001) {
            toast.error(`Amount cannot exceed balance due (${balanceDue.toFixed(2)})`)
            return
        }
        recordPayment.mutate(
            {
                saleId,
                amount: values.amount,
                paymentMethod: values.paymentMethod,
                reference: values.reference?.trim() || undefined,
            },
            {
                onSuccess: async () => {
                    form.setValue("reference", "")
                    await onRecorded()
                },
                onError: (e: unknown) => {
                    const msg = e instanceof Error ? e.message : "Could not record payment"
                    toast.error(msg)
                },
            }
        )
    })

    if (balanceDue <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                This sale is fully paid. No further payments can be recorded.
            </p>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-3">
                <FormField
                    control={form.control}
                    name="amount"
                    rules={{
                        required: "Amount is required",
                        validate: (v) =>
                            (Number.isFinite(v) && v > 0) ||
                            "Enter an amount greater than zero",
                    }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Amount</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-8 text-sm"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    name={field.name}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    value={Number.isFinite(field.value) ? field.value : ""}
                                    onChange={(e) => {
                                        const raw = e.target.value
                                        field.onChange(
                                            raw === "" ? Number.NaN : parseFloat(raw)
                                        )
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {METHOD_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Reference (optional)</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-8 text-sm"
                                    placeholder="Check #, transaction id…"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="sm" className="h-8" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        "Record payment"
                    )}
                </Button>
            </form>
        </Form>
    )
}
