"use client"

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import withAuth from "@/libs/withAuth";
import Swal from 'sweetalert2';

function Page() {
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedProdi, setSelectedProdi] = useState('');
    const [actionType, setActionType] = useState('');
    const [selectedWeb, setSelectedWeb] = useState('');
    const [groupName, setGroupName] = useState('');
    const [universityWebList, setUniversityWebList] = useState([]);
    const { status } = useSession();
    const [formWeb, setFormWebData] = useState({
        name: '',
        website_id: '',
    });
    const [facultyData, setFacultyData] = useState([]);
    const [programData, setProgramData] = useState([]);
    const [programWebList, setProgramWebList] = useState([]);
    const [facultyWebList, setFacultyWebList] = useState([]);

    console.log(facultyData);
    
    useEffect(() => {
        if (status === "authenticated") {
            fetchUniversityWebList();
        }
    }, [status]);

    console.log("hello", formWeb);

    const fetchUniversityWebList = async () => {
        try {
            const response = await fetch('/api/website/university');

            if (response.ok) {
                const data = await response.json();
                setUniversityWebList(data.data);
                console.log(data.data);
            } else {
                console.error('Failed to fetch faculties');
            }
        } catch (error) {
            console.error(error);
        }
    }



    const handleSelectChange = (value) => {
        setSelectedOption(value);
        setSelectedFaculty('');
        setActionType('');
        setSelectedProdi('');
        setSelectedWeb('');
        setGroupName('');
        fetchFaculty()

    };

    const handleFacultyChange = (value) => {
        // Reset states related to action type and below when changing faculty
        setSelectedFaculty(value);
        setActionType('');
        setSelectedProdi('');
        setSelectedWeb('');
        setGroupName('');
    };

    const handleActionTypeChange = (value) => {
        // Reset states related to prodi and web when changing action type
        setActionType(value);
        setSelectedProdi('');
        setSelectedWeb('');
        setGroupName('');
        setFormWebData((prevData) => ({
            ...prevData,
            website_id: selectedFaculty
        }));
        fetchProdi(selectedFaculty)
        fetchFakultasWeb(selectedFaculty)
    };

    const handleProdiChange = (value) => {
        // Reset web and groupName when changing prodi
        setSelectedProdi(value);
        setSelectedWeb('');
        setGroupName('');
        setFormWebData((prevData) => ({
            ...prevData,
            website_id: value
        }));
        fetchProdiWeb(value)

    };

    const handleWebChange = (value) => {
        setSelectedWeb(value);
        setGroupName('');
        setFormWebData((prevData) => ({
            ...prevData,
            website_id: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form data yang dikirim:', {
            name: formWeb.name,
            website_id: selectedWeb
        });

        let response;

        if (selectedOption) {
            response = await fetch('/api/group-saran', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formWeb.name,
                    website_id: selectedWeb
                })
            });
        }

        if (response.ok) {
            const data = await response.json();
            console.log('Post created:', data);
            setFormWebData({
                name: '',
                website_id: '',
            });
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Sukses Menambahkan Group Saran',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } else {
            const errorData = await response.json();
            console.log(`Error: ${errorData.message}`);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Gagal Mengupdate Data: ${errorData.message}`,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await fetch("/api/departments/fakultas")

            if (response.ok) {
                const data = await response.json()
                console.log(data);

                setFacultyData(data.data)
            } else {
                console.error('Failed to fetch faculties');
            }

        } catch (error) {
            console.error(error);
        }
    }

    const fetchProdi = async (facultyID) => {
        try {
            const response = await fetch(`/api/departments/fakultas/prodi/${facultyID}`);

            if (response.ok) {
                const data = await response.json()
                console.log("prodi", data);

                setProgramData(data.data);
            } else {
                console.error('Failed to fetch study programs');
            }

        } catch (error) {
            console.error(error);
        }
    }

    const fetchProdiWeb = async (prodiID) => {
        try {
            const response = await fetch(`/api/website/prodi/${prodiID}`);

            if (response.ok) {
                const data = await response.json()
                console.log("prodi", data);

                setProgramWebList(data.data);
            } else {
                console.error('Failed to fetch study programs');
            }

        } catch (error) {
            console.error(error);
        }
    }

    const fetchFakultasWeb = async (fakultasID) => {
        try {
            const response = await fetch(`/api/website/fakultas?id=${fakultasID}`);

            if (response.ok) {
                const data = await response.json()
                console.log("prodi", data);

                if (data && data.data) {
                    setFacultyWebList([data.data]); // Masukkan objek ke dalam array
                } else {
                    setFacultyWebList([]); // Jika tidak ada data, set array kosong
                }
            } else {
                console.error('Failed to fetch study programs');
            }

        } catch (error) {
            console.error(error);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormWebData({ ...formWeb, [name]: value });
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Add Departments"} />
                <main className='p-4 space-y-4'>
                    <form className="grid gap-6" onSubmit={handleSubmit}>
                        <div className="grid gap-3">
                            <Label htmlFor="level">Pilih Tingkat</Label>
                            <Select onValueChange={handleSelectChange}>
                                <SelectTrigger id="level" aria-label="Select level">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Universitas">Universitas</SelectItem>
                                    <SelectItem value="Fakultas">Fakultas</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* University Web Selection */}
                            {selectedOption === 'Universitas' && (
                                <div className="grid gap-3">
                                    <Label htmlFor="web">Pilih Web Universitas</Label>
                                    <Select onValueChange={handleWebChange}>
                                        <SelectTrigger id="web" aria-label="Pilih Web">
                                            <SelectValue placeholder="Pilih Web Universitas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universityWebList.map((univWeb) => (
                                                <SelectItem key={univWeb._id} value={univWeb._id}>
                                                    {univWeb.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedWeb && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Nama Group Saran</Label>
                                            <Input id="name" name="name" placeholder="Masukkan nama grup" value={formWeb.name} onChange={handleInputChange} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedOption === 'Fakultas' && (
                                <div className="grid gap-3">
                                    <Label htmlFor="faculty">Pilih Fakultas</Label>
                                    <Select onValueChange={handleFacultyChange}>
                                        <SelectTrigger id="faculty" aria-label="Select Faculty">
                                            <SelectValue placeholder="Pilih Fakultas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyData.map((faculty) => (
                                                <SelectItem key={faculty._id} value={faculty._id}>
                                                    {faculty.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                            )}

                            {selectedFaculty && (
                                <div className="grid gap-3">
                                    <Label htmlFor="action-type">Pilih Tindakan</Label>
                                    <Select onValueChange={handleActionTypeChange}>
                                        <SelectTrigger id="action-type" aria-label="Pilih tindakan">
                                            <SelectValue placeholder="Pilih tindakan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Prodi">Pilih Prodi</SelectItem>
                                            <SelectItem value="Masukkan">Buat Grup Saran Baru</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}



                            {actionType === 'Prodi' && (
                                <div className="grid gap-3">
                                    <Label htmlFor="prodi">Pilih Prodi</Label>
                                    <Select onValueChange={handleProdiChange}>
                                        <SelectTrigger id="prodi" aria-label="Pilih Prodi">
                                            <SelectValue placeholder="Pilih Prodi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programData.map((prodi) => (
                                                <SelectItem key={prodi._id} value={prodi._id}>
                                                    {prodi.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedProdi && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="web">Pilih Web untuk Group Saran</Label>
                                            <Select onValueChange={handleWebChange}>
                                                <SelectTrigger id="web" aria-label="Pilih Web">
                                                    <SelectValue placeholder="Pilih Web" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programWebList.map((prodiWeb) => (
                                                        <SelectItem key={prodiWeb._id} value={prodiWeb._id}>
                                                            {prodiWeb.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {selectedWeb && (
                                                <div className="grid gap-3">
                                                    <Label htmlFor="name">Nama Group Saran</Label>
                                                    <Input id="name" name="name" placeholder="Masukkan nama grup" value={formWeb.name} onChange={handleInputChange} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {actionType === 'Masukkan' && (
                                <div className="grid gap-3">
                                    <Label htmlFor="web">Pilih Web yang Ada</Label>
                                    <Select onValueChange={handleWebChange}>
                                        <SelectTrigger id="web" aria-label="Pilih Web">
                                            <SelectValue placeholder="Pilih Web" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facultyWebList.map((facultyWeb) => (
                                                <SelectItem key={facultyWeb._id} value={facultyWeb._id}>
                                                    {facultyWeb.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedWeb && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Nama Group Saran</Label>
                                            <Input id="name" name="name" placeholder="Masukkan nama grup" value={formWeb.name} onChange={handleInputChange} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex pt-4 flex-col mx-auto gap-4">
                                <Button className="w-96">Submit</Button>
                                <Button variant="outline" className="w-96">Cancel</Button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}

export default withAuth(Page);