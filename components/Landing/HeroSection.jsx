// components/Hero.js
import Link from 'next/link';
import { Button } from "@/components/ui/button"

const Hero = () => {
    return (
        // <section className="flex items-center h-screen mx-32">
        //     <div className="">
        //         <h1 className="text-4xl font-bold text-gray-800">
        //             Sampaikan Saran Anda untuk Meningkatkan Website Fakultas Teknik
        //         </h1>
        //         <p className="mt-4 text-lg text-gray-600">
        //             Platform khusus untuk mahasiswa Fakultas Teknik dalam memberikan saran dan masukan demi peningkatan kualitas layanan digital kami.
        //         </p>
        //         <div className="mt-6">
        //             <Link href="/login" className="">
        //                 <Button type="submit" className="relative">
        //                     Login
        //                 </Button>
        //             </Link>
        //         </div>
        //     </div>
        // </section >
        <div className="container pt-24 md:pt-48 px-6 mx-auto flex flex-wrap flex-col md:flex-row items-center">
            <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
                <h1 className="my-4 text-2xl md:text-4xl font-bold leading-tight text-center md:text-left slide-in-bottom-h1">
                    Saranin
                </h1>
                <p className="leading-normal text-base md:text-2xl text-[#64748B] mb-8 text-center md:text-left slide-in-bottom-subtitle">
                    Layanan Saran Web Universitas dan Fakultas Teknik
                </p>
                {/* <div className="flex w-full justify-center md:justify-start pb-24 lg:pb-0 fade-in">
                    <img src="App Store.svg" className="h-12 pr-4 bounce-top-icons" alt="App Store" />
                    <img src="Play Store.svg" className="h-12 bounce-top-icons" alt="Play Store" />
                </div> */}
                <div className="flex justify-center md:justify-start mt-6 space-x-4">
                    <Link href="/login" className="">
                        <Button type="submit" className="relative w-80 md:w-40 ">
                            Kontak
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Right Col */}
            <div className="w-full xl:w-3/5 py-6 overflow-y-hidden">
                <img className="w-5/6 mx-auto lg:mr-0 slide-in-bottom" src="saran.svg" alt="Devices" />
            </div>
            {/* Footer */}
            {/* <div className="w-full pt-16 pb-6 text-sm text-center md:text-left fade-in">
                <a className="text-gray-500 no-underline hover:no-underline" href="#">
                    &copy; App 2019
                </a>
            </div> */}
        </div>

    );
};

export default Hero;
