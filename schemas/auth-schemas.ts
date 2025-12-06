import { z } from "zod"

export const LoginSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, {
            message: "Password must contain at least 6 characters",
        })
        .max(250, {
            message: "Password must contain at most 250 characters",
        }),
})

export const RegisterSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, {
            message: "Password must contain at least 6 characters",
        })
        .max(250, {
            message: "Password must contain at most 250 characters",
        }),
})
