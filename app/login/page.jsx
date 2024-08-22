"use client"
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password
        });

        if (res.ok) {
            router.push('/dashboard');
        } else {
            // setError(res.error);
            setLoadingForm(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // setError(null);
        // setLoadingGoogle(true);

        console.log('Starting Google sign-in process');

        const googleRes = await signIn('google', { redirect: false });

        console.log('Google sign-in response:', googleRes);

        if (googleRes.ok) {
            console.log('Google sign-in successful, redirecting to /dashboard');
            router.push('/dashboard');
        } else {
            console.log('Google sign-in failed:', googleRes.error);
            //   setError(googleRes.error);
            //   setLoadingGoogle(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <form className='grid gap-4' action="" onSubmit={handleSubmit}>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="ml-auto inline-block text-sm underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input id="password" type="password" name="password" required value={formData.password} onChange={handleInputChange} />
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full pt-2">
                            Login with Google
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default LoginForm;
