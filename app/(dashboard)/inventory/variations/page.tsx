"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { variationAPI, type VariationOptionDto } from "@/lib/api/variation"
import { TopBar } from "@/components/layout/TopBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"
import { ChevronLeft, Layers, Plus, X } from "lucide-react"

const NEW_OPTION_VALUE = "__new__"

export default function VariationsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("returnTo") ?? ""

    const [options, setOptions] = useState<VariationOptionDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
    const [newOptionName, setNewOptionName] = useState("")
    const [valueInputs, setValueInputs] = useState<string[]>([""])
    const [submitting, setSubmitting] = useState(false)

    const fetchList = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await variationAPI.getOptions()
            setOptions(data)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load variation options"
            setError(message)
            setOptions([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    const isNewOption = selectedOptionId === NEW_OPTION_VALUE
    const selectedOption = selectedOptionId && selectedOptionId !== NEW_OPTION_VALUE
        ? options.find((o) => o.id === Number(selectedOptionId))
        : null

    const addValueSlot = () => setValueInputs((prev) => [...prev, ""])
    const removeValueSlot = (index: number) =>
        setValueInputs((prev) => prev.filter((_, i) => i !== index))
    const setValueAt = (index: number, value: string) =>
        setValueInputs((prev) => {
            const next = [...prev]
            next[index] = value
            return next
        })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const values = valueInputs.map((v) => v.trim()).filter(Boolean)
        if (values.length === 0) {
            toast.error("Add at least one value.")
            return
        }
        if (isNewOption) {
            const name = newOptionName.trim()
            if (!name) {
                toast.error("Enter a name for the new option.")
                return
            }
            setSubmitting(true)
            try {
                const { id: optionId } = await variationAPI.createOption({
                    name,
                    displayOrder: options.length,
                })
                for (let i = 0; i < values.length; i++) {
                    await variationAPI.createValue(optionId, { value: values[i], displayOrder: i })
                }
                toast.success(`"${name}" created with ${values.length} value(s).`)
                setNewOptionName("")
                setValueInputs([""])
                setSelectedOptionId(null)
                await fetchList()
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to create option"
                toast.error(msg)
            } finally {
                setSubmitting(false)
            }
            return
        }
        if (!selectedOption) {
            toast.error("Select an option or create a new one.")
            return
        }
        setSubmitting(true)
        try {
            const existingCount = selectedOption.values?.length ?? 0
            for (let i = 0; i < values.length; i++) {
                await variationAPI.createValue(selectedOption.id, {
                    value: values[i],
                    displayOrder: existingCount + i,
                })
            }
            toast.success(`Added ${values.length} value(s) to "${selectedOption.name}".`)
            setValueInputs([""])
            await fetchList()
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to add values"
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const displayOptions = options
    const valuesCell = (row: VariationOptionDto) =>
        row.values?.length
            ? row.values
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((v) => v.value)
                  .join(", ")
            : "—"

    return (
        <div className="space-y-4">
            <TopBar
                title="Variation options"
                description="Add values to options or create new ones. Use when building products with variations."
                actions={[
                    ...(returnTo
                        ? [
                              {
                                  label: "Back to Product Create",
                                  icon: <ChevronLeft className="h-3.5 w-3.5" />,
                                  onClick: () => router.push(returnTo),
                                  variant: "outline" as const,
                                  size: "sm" as const,
                              },
                          ]
                        : []),
                ]}
            />

            <Card className="border border-border/50">
                <CardHeader className="pb-2 pt-3 px-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                            <Layers className="h-3 w-3 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-semibold">Add values</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-3">
                    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={selectedOptionId ?? ""}
                                onValueChange={(v) => {
                                    setSelectedOptionId(v || null)
                                    setValueInputs([""])
                                }}
                            >
                                <SelectTrigger className="h-8 w-[140px] text-sm">
                                    <SelectValue placeholder="Option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NEW_OPTION_VALUE}>+ New option</SelectItem>
                                    {displayOptions.map((opt) => (
                                        <SelectItem key={opt.id} value={String(opt.id)}>
                                            {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isNewOption && (
                                <Input
                                    placeholder="Option name"
                                    value={newOptionName}
                                    onChange={(e) => setNewOptionName(e.target.value)}
                                    className="h-8 w-32 text-sm"
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                            {valueInputs.map((v, i) => (
                                <div key={i} className="flex items-center gap-0.5">
                                    <Input
                                        placeholder="Value"
                                        value={v}
                                        onChange={(e) => setValueAt(i, e.target.value)}
                                        className="h-8 w-20 text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => removeValueSlot(i)}
                                        disabled={valueInputs.length <= 1}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={addValueSlot}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "…" : isNewOption ? "Create option" : "Add values"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border border-border/50">
                <CardHeader className="pb-2 pt-3 px-4 border-b border-border/50">
                    <CardTitle className="text-sm font-semibold">All options</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 px-4 pb-3">
                    {loading ? (
                        <Loader text="Loading…" />
                    ) : error ? (
                        <p className="py-4 text-sm text-destructive">{error}</p>
                    ) : options.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">No options yet. Add one above.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-7 text-[11px] font-medium text-muted-foreground">Name</TableHead>
                                    <TableHead className="h-7 text-[11px] font-medium text-muted-foreground">Values</TableHead>
                                    <TableHead className="h-7 w-12 text-[11px] font-medium text-muted-foreground">Order</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {options.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="py-1 font-medium">{row.name}</TableCell>
                                        <TableCell className="py-1 text-muted-foreground">{valuesCell(row)}</TableCell>
                                        <TableCell className="py-1 text-muted-foreground tabular-nums">
                                            {row.displayOrder}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
