"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ResetPassword() {
    const searchParams = useSearchParams()
    const router = useRouter()
    console.log("ini router",router);
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (!token) {
            setError("Token reset password tidak ditemukan")
        }
    }, [token])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Reset states
        setError("")
        setSuccess("")

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Password tidak cocok")
            return
        }

        if (formData.newPassword.length < 6) {
            setError("Password harus minimal 6 karakter")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: formData.newPassword
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan')
            }

            setSuccess('Password berhasil direset')
            setFormData({ newPassword: '', confirmPassword: '' })
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login')
            }, 2000)

        } catch (err) {
            setError(err.message || 'Gagal mereset password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="border-green-500 bg-green-50">
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Enter your new password"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Re-enter New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Confirm your new password"
                                className="w-full"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading || !token}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Remember your password?{" "}
                        <Link href="/login" className="underline" prefetch={false}>
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}