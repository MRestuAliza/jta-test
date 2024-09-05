"use client"

import React, { useState } from "react";
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import withAuth from "@/libs/withAuth";

function Page() {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudyProgram, setSelectedStudyProgram] = useState('');
  const [isDataExist, setIsDataExist] = useState(null);
  const [isFacultyFormActive, setIsFacultyFormActive] = useState(false);
  const [isProgramDataExist, setIsProgramDataExist] = useState(null);

  // Handle level selection
  const handleSelectChange = (value) => {
    setSelectedOption(value);
    setSelectedFaculty('');
    setSelectedStudyProgram('');
    setIsDataExist(null);
    setIsFacultyFormActive(false);
    
    setIsProgramDataExist(null);
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departments"} />
        <main className='p-4 space-y-4'>
          <div className="grid gap-6">

            {/* Level Selection */}
            <div className="grid gap-3">
              <Label htmlFor="level">Pilih Tingkat</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger id="level" aria-label="Select level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* University Form */}
            {selectedOption === 'university' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <Label htmlFor="university-name">Name</Label>
                  <Input id="university-name" placeholder="Enter the university name" />
                </div>
                <div>
                  <Label htmlFor="university-link">Website Link</Label>
                  <Input id="university-link" placeholder="Enter the university website link" />
                </div>
              </div>
            )}

            {/* Faculty Data Exist Check */}
            {selectedOption === 'faculty' && (
              <div className="grid gap-3">
                <Label htmlFor="data-exist">Apakah data fakultas sudah ada?</Label>
                <Select onValueChange={handleDataExistChange}>
                  <SelectTrigger id="data-exist" aria-label="Data exist">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Faculty Name Form */}
            {selectedOption === 'faculty' && !isDataExist && isFacultyFormActive && (
              <div className="grid gap-3">
                <Label htmlFor="faculty-name">Faculty Name</Label>
                <Input id="faculty-name" placeholder="Enter the faculty name" />
              </div>
            )}

            {/* Faculty Selection Form */}
            {selectedOption === 'faculty' && isDataExist && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="faculty">Select Faculty</Label>
                  <Select onValueChange={handleFacultySelectChange}>
                    <SelectTrigger id="faculty" aria-label="Select faculty">
                      <SelectValue placeholder="Select faculty" />
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
                        <SelectTrigger id="program-data-exist" aria-label="Study program data exist">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
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

                    {/* New Program Name Form */}
                    {isProgramDataExist === false && (
                      <div className="grid gap-3">
                        <Label htmlFor="new-program-name">New Program Name</Label>
                        <Input id="new-program-name" placeholder="Enter the new program name" />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex pt-4 flex-col mx-auto gap-4">
              <Button className="w-96">Submit</Button>
              <Button variant="outline" className="w-96">Cancel</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default withAuth(Page)
