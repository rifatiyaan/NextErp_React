"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { LoginFormType } from "@/types/auth"
import { LoginSchema } from "@/schemas/auth-schemas"
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

export function LoginForm() {
    const { login } = useAuth()

    const form = useForm<LoginFormType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { isSubmitting } = form.formState
    const isDisabled = isSubmitting

    async function onSubmit(data: LoginFormType) {
        try {
            await login(data)
            toast.success("Login successful!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Login failed")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid grow gap-2">
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
                    Sign In
                </ButtonLoading>
                <div className="-mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline">
                        Sign up
                    </Link>
                </div>
            </form>
        </Form>
    )
}
