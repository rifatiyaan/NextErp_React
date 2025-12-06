import { LoginForm } from "@/components/auth/LoginForm"
import {
    Auth,
    AuthDescription,
    AuthForm,
    AuthHeader,
    AuthTitle,
} from "@/components/auth/AuthLayout"

export default function LoginPage() {
    return (
        <Auth>
            <AuthHeader>
                <AuthTitle>Sign In</AuthTitle>
                <AuthDescription>
                    Enter your email below to sign in to your account
                </AuthDescription>
            </AuthHeader>
            <AuthForm>
                <LoginForm />
            </AuthForm>
        </Auth>
    )
}
