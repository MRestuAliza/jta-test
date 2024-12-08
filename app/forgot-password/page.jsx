import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Component() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>Enter your email below to receive a password reset link</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required />
                            <p className="text-sm text-gray-500">A password reset link will be sent to the provided email address.</p>
                        </div>
                        <Button type="submit" className="w-full">
                            Send Reset Link
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Remembered your password?{" "}
                        <Link href="#" className="underline" prefetch={false}>
                            Go back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}