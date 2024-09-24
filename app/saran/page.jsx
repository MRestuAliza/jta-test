"use client"

import React, { useState } from "react";
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

    const handleSelectChange = (value) => {
        // Reset all states when changing the level
        setSelectedOption(value);
        setSelectedFaculty('');
        setActionType('');
        setSelectedProdi('');
        setSelectedWeb('');
        setGroupName('');
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
    };

    const handleProdiChange = (value) => {
        // Reset web and groupName when changing prodi
        setSelectedProdi(value);
        setSelectedWeb('');
        setGroupName('');
    };

    const handleWebChange = (value) => {
        // Only reset groupName when changing web
        setSelectedWeb(value);
        setGroupName('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire("Success", "Group saran berhasil dibuat", "success");
    };

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
                                            <SelectItem value="WebUniv1">Web Universitas 1</SelectItem>
                                            <SelectItem value="WebUniv2">Web Universitas 2</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {selectedWeb && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="group-name">Nama Group Saran</Label>
                                            <Input id="group-name" placeholder="Masukkan nama grup" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
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
                                            <SelectItem value="Teknik">Fakultas Teknik</SelectItem>
                                            <SelectItem value="Pertanian">Fakultas Pertanian</SelectItem>
                                            {/* Add more fakultas here */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedFaculty === 'Teknik' && (
                                <div className="grid gap-3">
                                    <Label htmlFor="action-type">Pilih Tindakan</Label>
                                    <Select onValueChange={handleActionTypeChange}>
                                        <SelectTrigger id="action-type" aria-label="Pilih tindakan">
                                            <SelectValue placeholder="Pilih tindakan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Prodi">Pilih Prodi</SelectItem>
                                            <SelectItem value="Masukkan">Masukkan Web Baru</SelectItem>
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
                                            <SelectItem value="Informatika">Teknik Informatika</SelectItem>
                                            <SelectItem value="Mesin">Teknik Mesin</SelectItem>
                                            {/* Add more prodi here */}
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
                                                    <SelectItem value="Web1">Web Fakultas Teknik</SelectItem>
                                                    <SelectItem value="Web2">Web Teknik Informatika</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {selectedWeb && (
                                                <div className="grid gap-3">
                                                    <Label htmlFor="group-name">Nama Group Saran</Label>
                                                    <Input id="group-name" placeholder="Masukkan nama grup" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
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
                                            <SelectItem value="Web1">Web Fakultas Teknik</SelectItem>
                                            <SelectItem value="Web2">Web Teknik Informatika</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {selectedWeb && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="group-name">Nama Group Saran</Label>
                                            <Input id="group-name" placeholder="Masukkan nama grup" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {groupName && (
                                <Button type="submit">Buat Group Saran</Button>
                            )}
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}

export default withAuth(Page);
