"use client"
import React from 'react';
import { useSession } from "next-auth/react";
import LoginForm from '@/app/login/page';

const withAuth = (WrappedComponent) => {
    return function ProtectedPage(props) {
        const { status } = useSession();

        if (status === "loading") {
            return (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            );
        }

        if (status !== "authenticated") {
            return <LoginForm />;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;