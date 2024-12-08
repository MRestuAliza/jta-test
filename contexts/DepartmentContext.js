"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSaran, setSaran] = useState([]);

  const fetchSaranData = async () => {
    try {
      // Fetch group saran data
      const groupResponse = await fetch('/api/group-saran');
      const groupData = await groupResponse.json();
      
      if (groupData.data) {
        // Transform data format to match department structure
        const saranItems = Array.isArray(groupData.data) 
          ? groupData.data.map(saran => ({
              _id: saran.link_advice,
              name: saran.name,
              type: 'saran'
            }))
          : [];
        return saranItems;
      }
      return [];
    } catch (error) {
      console.error('Error fetching saran data:', error);
      return [];
    }
  };

  const fetchDepartmentData = async (id) => {
    try {
      const response = await fetch(`/api/institusi?id=${id}`);
      const data = await response.json();
      
      let departments = [];
      
      if (data.data.fakultas_websites) {
        departments.push(...data.data.fakultas_websites);
      }
      if (data.data.prodi_websites) {
        departments.push(...data.data.prodi_websites);
      }
      if (data.data.university_websites) {
        departments.push(...data.data.university_websites);
      }
      if (data.data.fakultas_list) {
        departments.push(...data.data.fakultas_list);
      }
      if (data.data.prodi_list) {
        departments.push(...data.data.prodi_list);
      }

      return departments;
    } catch (error) {
      console.error('Error fetching department data:', error);
      return [];
    }
  };

  const fetchAllData = async () => {
    try {
      const [departments, saranData] = await Promise.all([
        fetchDepartmentData(process.env.NEXT_PUBLIC_UNIVERSITY_ID),
        fetchSaranData()
      ]);

      const allData = [...departments, ...saranData];
      setAllDepartments(allData);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getNameFromId = (id) => {
    if (id === 'd') return 'detail';
    const item = allDepartments.find(d => 
      d._id === id || 
      d.id === id || 
      d.link_advice === id
    );
    return item?.name || id;
  };


  return (
    <DepartmentContext.Provider value={{ allDepartments, getNameFromId }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};