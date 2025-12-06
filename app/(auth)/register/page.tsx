import { RegisterForm } from "@/components/auth/RegisterForm"
import {
    Auth,
    AuthDescription,
    AuthForm,
    AuthHeader,
    AuthTitle,
} from "@/components/auth/AuthLayout"

export default function RegisterPage() {
    return (
        <Auth>
            <AuthHeader>
                <AuthTitle>Create an Account</AuthTitle>
                <AuthDescription>
                    Enter your email below to create your account
                </AuthDescription>
            </AuthHeader>
            <AuthForm>
                <RegisterForm />
            </AuthForm>
        </Auth>
    )
}
