// components/Hero.js
import Link from 'next/link';
import { Button } from "@/components/ui/button"

const Hero = () => {
    return (
        <section className="flex items-center h-screen mx-32">
            <div className="">
                <h1 className="text-4xl font-bold text-gray-800">
                    Sampaikan Saran Anda untuk Meningkatkan Website Fakultas Teknik
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Platform khusus untuk mahasiswa Fakultas Teknik dalam memberikan saran dan masukan demi peningkatan kualitas layanan digital kami.
                </p>
                <div className="mt-6">
                    <Link href="/login" className="">
                        <Button type="submit" className="relative">
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </section >
    );
};

export default Hero;
