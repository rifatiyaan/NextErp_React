"use client"

import { z } from "zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { CustomerFormValues, customerSchema } from "@/schemas/customer"
import { customerAPI } from "@/lib/api/customer"
import { Customer } from "@/types/customer"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, X, User } from "lucide-react"
import Image from "next/image"

interface CustomerFormProps {
    initialData?: Customer
    isEdit?: boolean
}

export function CustomerForm({ initialData, isEdit }: CustomerFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [avatar, setAvatar] = useState<File | string | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        initialData?.metadata?.notes ? null : null // We'll use a placeholder for now
    )

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            title: initialData?.title || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
            isActive: initialData?.isActive ?? true,
            metadata: {
                loyaltyCode: initialData?.metadata?.loyaltyCode || "",
                notes: initialData?.metadata?.notes || "",
                nationalId: initialData?.metadata?.nationalId || "",
            },
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                email: initialData.email || "",
                phone: initialData.phone || "",
                address: initialData.address || "",
                isActive: initialData.isActive,
                metadata: {
                    loyaltyCode: initialData.metadata?.loyaltyCode || "",
                    notes: initialData.metadata?.notes || "",
                    nationalId: initialData.metadata?.nationalId || "",
                },
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: CustomerFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                title: data.title,
                email: data.email || undefined,
                phone: data.phone || undefined,
                address: data.address || undefined,
                isActive: data.isActive,
                metadata: {
                    loyaltyCode: data.metadata?.loyaltyCode || undefined,
                    notes: data.metadata?.notes || undefined,
                    nationalId: data.metadata?.nationalId || undefined,
                },
            }

            if (isEdit && initialData) {
                await customerAPI.updateCustomer(initialData.id, {
                    ...payload,
                    id: initialData.id,
                })
                toast.success("Customer updated successfully")
            } else {
                await customerAPI.createCustomer(payload)
                toast.success("Customer created successfully")
            }
            router.push("/inventory/customers")
        } catch (error: any) {
            console.error("Failed to save customer:", error)
            toast.error(error?.message || "Failed to save customer")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size must be less than 2MB")
                return
            }
            setAvatar(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveAvatar = () => {
        setAvatar(null)
        setAvatarPreview(null)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Update your customer details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Profile Picture Section */}
                        <div className="flex items-start gap-6 pb-6 border-b">
                            <div className="relative">
                                {avatarPreview ? (
                                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border">
                                        <Image
                                            src={avatarPreview}
                                            alt="Customer avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            document.getElementById("avatar-upload")?.click()
                                        }}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveAvatar}
                                        disabled={!avatarPreview && !avatar}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove Photo
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    JPG, GIF or PNG. Max size of 2MB.
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Customer name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={true}
                                                        disabled
                                                        className="opacity-50"
                                                    />
                                                    <Input
                                                        type="tel"
                                                        placeholder="+1 555 867 5309"
                                                        {...field}
                                                        value={field.value || ""}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metadata.loyaltyCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loyalty Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="LOYALTY123"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metadata.nationalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>National ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="National ID"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="customer@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123 Main Street, Apt 4B"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                                                        {field.value ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Full Width Fields */}
                        <FormField
                            control={form.control}
                            name="metadata.notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about the customer..."
                                            className="min-h-[100px]"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={isSubmitting}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

