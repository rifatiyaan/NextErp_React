"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { RegisterFormType } from "@/types/auth"
import { RegisterSchema } from "@/schemas/auth-schemas"
import { useAuth } from "@/contexts/auth-context"

import { ButtonLoading } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function RegisterForm() {
    const { register } = useAuth()

    const form = useForm<RegisterFormType>({
        resolver: zodResolver(RegisterSchema),
    })

    const { isSubmitting, isDirty } = form.formState
    const isDisabled = isSubmitting || !isDirty

    async function onSubmit(data: RegisterFormType) {
        try {
            await register(data)
            toast.success("Registration successful!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Registration failed")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid gap-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
                    Create Account
                </ButtonLoading>
                <div className="-mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </form>
        </Form>
    )
}
