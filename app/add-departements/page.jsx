"use client"

import React, { useState } from "react";
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function Page() {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [isDataExist, setIsDataExist] = useState(null);

  const handleSelectChange = (value) => {
    setSelectedOption(value);

    if (value === 'university') {
      setSelectedFaculty('');
    }
  };

  const handleFacultySelectChange = (value) => {
    setSelectedFaculty(value);
  };

  const handleDataExistChange = (value) => {
    setIsDataExist(value === 'Yes');
    if (value === 'No') {
      setSelectedOption('');
      setSelectedFaculty('');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departments"} />
        <main className='p-4 space-y-4'>
          <div className="grid gap-6">

            {/* Data Exist Selection */}
            <div className="grid gap-3">
              <Label htmlFor="data-exist">Does the department data already exist?</Label>
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

            {/* Level Selection */}
            {isDataExist !== null && (
              <div className="grid gap-3">
                <Label htmlFor="level">Select level</Label>
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
            )}

            {/* University Form */}
            {selectedOption === 'university' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <Label htmlFor="university-link">Name</Label>
                  <Input id="university-link" placeholder="Enter the university website link" />
                </div>
                <div>
                  <Label htmlFor="university-link">Website Link</Label>
                  <Input id="university-link" placeholder="Enter the university website link" />
                </div>
              </div>
            )}

            {/* Faculty Selection Form */}
            {selectedOption === 'faculty' && (
              <div className="grid gap-3">
                <Label htmlFor="faculty">Select faculty</Label>
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
            )}

            {/* Study Program Selection Form */}
            {selectedFaculty && (
              <div className="grid gap-3">
                <Label htmlFor="study-program">Select Study Program</Label>
                <Select id="study-program" aria-label="Select study program">
                  <SelectTrigger>
                    <SelectValue placeholder="Select study program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informatics">Informatics</SelectItem>
                    <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
