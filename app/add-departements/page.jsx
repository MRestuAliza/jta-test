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
  const [selectedStudyProgram, setSelectedStudyProgram] = useState('');
  const [isDataExist, setIsDataExist] = useState(null);
  const [isFacultyFormActive, setIsFacultyFormActive] = useState(false);
  const [isProgramDataExist, setIsProgramDataExist] = useState(null);
  const [formWeb, setFormWebData] = useState({
    name: '',
    link: '',
    type: "",
    university_id: process.env.NEXT_PUBLIC_UNIVERSITY_ID
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormWebData({ ...formWeb, [name]: value });
  };


  // Handle level selection
  const handleSelectChange = (value) => {
    setSelectedOption(value);
    setSelectedFaculty('');
    setSelectedStudyProgram('');
    setIsDataExist(null);
    setIsFacultyFormActive(false);
    setIsProgramDataExist(null);

    // Update formWeb with the selected type
    setFormWebData((prevData) => ({ ...prevData, type: value }));
  };

  // Handle faculty selection
  const handleFacultySelectChange = (value) => {
    setSelectedFaculty(value);

    setIsProgramDataExist(null); // Reset program data existence
  };

  // Handle data existence check for faculty
  const handleDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsDataExist(exists);
    if (!exists) {
      setIsFacultyFormActive(true); // Show faculty form if data does not exist
    } else {
      setIsFacultyFormActive(false); // Hide faculty form if data exists
    }

    setIsProgramDataExist(null); // Reset program data existence
    setSelectedStudyProgram(''); // Reset selected study program
  };

  // Handle program data existence check
  const handleProgramDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsProgramDataExist(exists);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      // Jika user memilih 'Universitas'
      if (selectedOption === 'Universitas') {
        response = await fetch('/api/website/university', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formWeb)
        });
      }

      // Jika user memilih 'Fakultas'
      else if (selectedOption === 'Fakultas') {
        // Jika data fakultas belum ada
        if (!isDataExist) {
          response = await fetch('/api/departments/fakultas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: formWeb.name, university_id: formWeb.university_id })
          });
        }

        // Jika data fakultas sudah ada, tambahkan web fakultas
        else {
          response = await fetch(`/api/website/fakultas/${selectedFaculty}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formWeb)
          });
        }
      }

      // Jika user memilih 'Program Studi'
      else if (selectedOption === 'Program Studi') {
        // Jika data program studi sudah ada
        if (isProgramDataExist) {
          response = await fetch(`/api/departments/prodi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: formWeb.name, university_id: formWeb.university_id })
          });
        }
      }

      // Handle respon API
      if (response.ok) {
        const data = await response.json();
        console.log('Post created:', data);
        setFormWebData({
          name: '',
          link: '',
          type: '',
          university_id: process.env.NEXT_PUBLIC_UNIVERSITY_ID
        });
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Sukses Menambahkan Data Website',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departments"} />
        <main className='p-4 space-y-4'>
          <form className="grid gap-6" onSubmit={handleSubmit}>

            {/* Level Selection */}
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
            </div>

            {/* University Form */}
            {selectedOption === 'Universitas' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <Label htmlFor="university-name">Name</Label>
                  <Input id="university-name" name="name" value={formWeb.name} onChange={handleInputChange} required placeholder="Masukkan nama website" />
                </div>
                <div>
                  <Label htmlFor="university-link">Website Link</Label>
                  <Input id="university-link" name="link" value={formWeb.link} onChange={handleInputChange} required placeholder="Masukkan tautan website" />
                </div>
              </div>
            )}

            {/* Faculty Data Exist Check */}
            {selectedOption === 'Fakultas' && (
              <div className="grid gap-3">
                <Label htmlFor="data-exist">Apakah data fakultas sudah ada?</Label>
                <Select onValueChange={handleDataExistChange}>
                  <SelectTrigger id="data-exist" aria-label="Data exist">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Ya</SelectItem>
                    <SelectItem value="No">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Faculty Name Form */}
            {selectedOption === 'Fakultas' && !isDataExist && isFacultyFormActive && (
              <div className="grid gap-3">
                <Label htmlFor="faculty-name">Nama fakultas</Label>
                <Input id="faculty-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama fakultas" />
              </div>
            )}

            {/* Faculty Selection Form */}
            {selectedOption === 'Fakultas' && isDataExist && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="faculty">Pilih fakultas</Label>
                  <Select onValueChange={handleFacultySelectChange}>
                    <SelectTrigger id="faculty" aria-label="Pilih fakultas">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Faculty of Engineering</SelectItem>
                      <SelectItem value="agriculture">Faculty of Agriculture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Study Program Data Existence Check */}
                {selectedFaculty && (
                  <>
                    <div className="grid gap-3">
                      <Label htmlFor="program-data-exist">Apakah data program studi sudah ada?</Label>
                      <Select onValueChange={handleProgramDataExistChange}>
                        <SelectTrigger id="program-data-exist" aria-label="Apakah data program studi sudah ada?">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Ya</SelectItem>
                          <SelectItem value="No">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Study Program Selection */}
                    {isProgramDataExist === true && (
                      <>
                        <div className="grid gap-3">
                          <Label htmlFor="study-program">Select Study Program</Label>
                          <Select onValueChange={(value) => setSelectedStudyProgram(value)}>
                            <SelectTrigger id="study-program" aria-label="Select study program">
                              <SelectValue placeholder="Select study program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="informatics">Informatics</SelectItem>
                              <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedStudyProgram && (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                            <div>
                              <Label htmlFor="program-name">Program Name</Label>
                              <Input id="program-name" placeholder="Enter the program name" />
                            </div>
                            <div>
                              <Label htmlFor="program-link">Program Website Link</Label>
                              <Input id="program-link" placeholder="Enter the program website link" />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {isProgramDataExist === false && (
                      <div className="grid gap-3">
                        <Label htmlFor="new-program-name">Nama program studi</Label>
                        <Input id="new-program-name" placeholder="Masukkan nama program studi" />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Success Alert */}
            {/* {isSuccess && (
              <Alert variant="succes" className="bg-green-400 text-white">
                <AlertCircle className="h-4 w-4" color="#FFFFFF" />
                <AlertTitle >Sukses</AlertTitle>
                <AlertDescription>
                  Sukses Menambahkan Data Website
                </AlertDescription>
              </Alert>
              // <AlertDestructive />
            )} */}

            <div className="flex pt-4 flex-col mx-auto gap-4">
              <Button className="w-96">Submit</Button>
              <Button variant="outline" className="w-96">Cancel</Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default withAuth(Page)
