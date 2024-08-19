"use client"

import React, { useState } from "react";
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function page() {
  const [isFacultyFormEnabled, setIsFacultyFormEnabled] = useState(false)

  const handleCheckboxChange = (e) => {
    setIsFacultyFormEnabled(e)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departements"} />
        <main className='p-4 space-y-4'>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="status">Does the department data already exist?</Label>
              <Select>
                <SelectTrigger id="status" aria-label="Select status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Yes</SelectItem>
                  <SelectItem value="published">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="status">Select level</Label>
              <Select>
                <SelectTrigger id="status" aria-label="Select status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">University</SelectItem>
                  <SelectItem value="published">Faculty</SelectItem>
                  <SelectItem value="archived">Study Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="include" onCheckedChange={handleCheckboxChange} />
              <label
                htmlFor="include"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Faculty Form.
              </label>
            </div>

            {isFacultyFormEnabled && (
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="name">Faculty Name</Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name of Study Program</Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full"
                  />
                  <div className="flex justify-center pt-3">
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Study Program Form
                    </Button>
                  </div>
                </div>

              </div>
            )}
            <div className="flex pt-4 flex-col mx-auto gap-4">
              <Button className="w-96">Submit</Button>
              <Button variant="outline" className="w-96">Cancle</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
