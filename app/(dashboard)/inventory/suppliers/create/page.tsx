import { SupplierForm } from "../_components/supplier-form"

export default function CreateSupplierPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Supplier</h1>
                <p className="text-muted-foreground">
                    Add a new supplier to your database
                </p>
            </div>
            <SupplierForm />
        </div>
    )
}

