// Types matching your .NET backend API

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    email: string
    password: string
    branchId?: string
}

export interface AuthResponse {
    token: string
}

export interface User {
    id: string
    email: string
    userName: string
    roles: string[]
    isGlobal?: boolean
}

export type LoginFormType = LoginDto
export type RegisterFormType = RegisterDto
