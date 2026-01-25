"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const transactions = [
    {
        id: "TXN-001",
        customer: "John Doe",
        amount: 1250.00,
        status: "completed",
        date: new Date(2024, 0, 15, 10, 30),
    },
    {
        id: "TXN-002",
        customer: "Jane Smith",
        amount: 850.50,
        status: "pending",
        date: new Date(2024, 0, 15, 9, 15),
    },
    {
        id: "TXN-003",
        customer: "Bob Johnson",
        amount: 2100.00,
        status: "completed",
        date: new Date(2024, 0, 15, 8, 45),
    },
    {
        id: "TXN-004",
        customer: "Alice Williams",
        amount: 450.75,
        status: "failed",
        date: new Date(2024, 0, 14, 16, 20),
    },
    {
        id: "TXN-005",
        customer: "Charlie Brown",
        amount: 3200.00,
        status: "completed",
        date: new Date(2024, 0, 14, 14, 10),
    },
]

export function RecentTransactions() {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "completed":
                return "default"
            case "pending":
                return "secondary"
            case "failed":
                return "destructive"
            default:
                return "secondary"
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest 5 transactions</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-medium">{transaction.id}</TableCell>
                                <TableCell>{transaction.customer}</TableCell>
                                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(transaction.status)}>
                                        {transaction.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {format(transaction.date, "MMM dd, yyyy HH:mm")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

