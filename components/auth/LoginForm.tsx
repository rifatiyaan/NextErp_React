"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { LoginFormType } from "@/types/auth"
import { LoginSchema } from "@/schemas/auth-schemas"
import { useAuth } from "@/contexts/auth-context"
import { useLogin } from "@/hooks/use-auth"
import { applyValidationErrors } from "@/lib/query/rhf"

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
    const { setSession } = useAuth()
    const login = useLogin()

    const form = useForm<LoginFormType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const isDisabled = login.isPending

    function onSubmit(data: LoginFormType) {
        login.mutate(data, {
            onSuccess: async (response) => {
                await setSession(response.token)
                toast.success("Login successful!")
            },
            onError: (error) => {
                if (!applyValidationErrors(error, form.setError)) {
                    toast.error(error instanceof Error ? error.message : "Login failed")
                }
            },
        })
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

                <ButtonLoading isLoading={login.isPending} disabled={isDisabled}>
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
