// components/Hero.js
import Link from 'next/link';
import { Button } from "@/components/ui/button"

const Hero = () => {
    return (
        <section className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    Sampaikan Saran Anda dengan Mudah
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Platform terbaik untuk memberikan saran dan feedback kepada institusi.
                </p>
                <div className="mt-6">
                    <Link href="/login" className="ml-auto flex-1 sm:flex-initial px-10">
                        <Button type="submit" className="relative">
                            Login
                        </Button>

                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
