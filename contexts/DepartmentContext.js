"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DepartmentContext = createContext();

export function useDepartment() {  // Tambahkan export function ini
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
}

export function DepartmentProvider({ children }) {
  const [allDepartments, setAllDepartments] = useState([]);
  
  const fetchSaranData = async () => {
    try {
      const groupResponse = await fetch('/api/group-saran');
      const groupData = await groupResponse.json();
      
      return groupData.data ? groupData.data.map(saran => ({
        _id: saran.link_advice,
        name: saran.name,
        type: 'saran'
      })) : [];
    } catch (error) {
      console.error('Error fetching saran data:', error);
      return [];
    }
  };

  const fetchDepartmentData = async (id) => {
    try {
      const response = await fetch(`/api/institusi?id=${id}`);
      const data = await response.json();
      
      return [
        ...(data.data.fakultas_websites || []),
        ...(data.data.prodi_websites || []),
        ...(data.data.university_websites || []),
        ...(data.data.fakultas_list || []),
        ...(data.data.prodi_list || [])
      ];
    } catch (error) {
      console.error('Error fetching department data:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [departments, saranData] = await Promise.all([
          fetchDepartmentData(process.env.NEXT_PUBLIC_UNIVERSITY_ID),
          fetchSaranData()
        ]);
        setAllDepartments([...departments, ...saranData]);
      } catch (error) {
        console.error('Error fetching all data:', error);
      }
    };

    fetchAllData();
  }, []); 

  const getNameFromId = useMemo(() => (id) => {
    if (!id) return '';  // Handle undefined/null case
    if (id === 'd') return 'detail';
    if (id === 'dashboard') return 'Dashboard';
    if (id === 'mahasiswa') return 'Mahasiswa';
    if (id === 'saran') return 'Saran';
    
    const item = allDepartments.find(d => 
      d._id === id || 
      d.id === id || 
      d.link_advice === id
    );
    return item?.name || id;
  }, [allDepartments]);

  const contextValue = useMemo(() => ({  // Optimasi dengan useMemo
    allDepartments,
    getNameFromId
  }), [allDepartments, getNameFromId]);

  return (
    <DepartmentContext.Provider value={contextValue}>
      {children}
    </DepartmentContext.Provider>
  );
}