"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Sidebar from "@/components/General/Sidebar";
import { ChevronDown, Building2, Globe } from "lucide-react";
import Header from "@/components/General/Header";
import { useRouter, redirect } from 'next/navigation';
import { getToken } from "next-auth/jwt";

const SectionHeader = ({ title, count, color, onClick, textColor }) => (
  <div className={`flex justify-between items-center p-4 ${color} text-${textColor} rounded-t-lg`}>
    <h2 className="text-lg font-semibold">{title}</h2>
  </div>
);

const ListItem = ({ id, link, icon, title, url, onNewClick, adviceExists }) => {
  const { push } = useRouter();
  const handleClick = () => {
    if (link) {
      push(`/saran/board/${link}`);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-2">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-gray-500">{url || 'No URL available'}</p>
      </div>
      {onNewClick ? (
        <Button onClick={() => onNewClick(id)}>
          Buka
        </Button>
      ) : (
        <Button onClick={handleClick}>
          Buat Saran
        </Button>
      )}
    </div>
  );
};

export default function Portal() {
  const [openCard, setOpenCard] = useState(1);
  const [departments, setDepartments] = useState({
    university_websites: [],
    fakultas_list: [],
  });
  const [fakultasList, setFakultasList] = useState({
    fakultas_websites: [],
    prodi_list: [],
  });
  const [prodiWebList, setProdiWebList] = useState({
    prodi_websites: []
  });
  const [openList, setOpenList] = useState({ 1: false, 2: false, 3: false });
  const [isLoading, setIsLoading] = useState({ 1: true, 2: true, 3: true });
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchDepartments();
    setIsPageLoading(false);
  };

  const handleNextCard = (nextCard) => {
    setOpenCard(nextCard);
  };

  const toggleList = (cardIndex) => {
    if (cardIndex === 1) {
      setOpenList({ 1: !openList[1], 2: false, 3: false });
      setOpenCard(1);
    } else if (cardIndex === 2) {
      setOpenList((prev) => ({ ...prev, [cardIndex]: !prev[cardIndex] }));
      setOpenCard(2);
    } else if (cardIndex === 3) {
      setOpenList((prev) => ({ ...prev, [cardIndex]: !prev[cardIndex] }));
      setOpenCard(3);
    }
  };

  const fetchDepartments = async () => {
    setIsLoading({ ...isLoading, 1: true });
    try {
      const response = await fetch(`/api/institusi?id=${process.env.NEXT_PUBLIC_UNIVERSITY_ID}`);
      if (response.ok) {
        const data = await response.json();
        setDepartments({
          university_websites: data.data.university_websites || [],
          fakultas_list: data.data.fakultas_list || []
        });
      }
      setIsLoading({ ...isLoading, 1: false });
    } catch (error) {
      setIsLoading({ ...isLoading, 1: false });
      console.error(error);
    }
  };

  const fetchFakultasList = async (fakultasId) => {
    setIsLoading({ ...isLoading, 2: true });
    try {
      const response = await fetch(`/api/institusi?id=${fakultasId}`);
      const data = await response.json();
      setFakultasList({
        fakultas_websites: data.data.fakultas_websites || [],
        prodi_list: data.data.prodi_list || [],
      });
      setIsLoading({ ...isLoading, 2: false });
    } catch (error) {
      setIsLoading({ ...isLoading, 2: false });
      console.error('Error fetching fakultas list:', error);
    }
  };

  const fetchProdiList = async (prodiId) => {
    setIsLoading({ ...isLoading, 3: true })
    try {
      const response = await fetch(`/api/institusi?id=${prodiId}`);
      const data = await response.json();
      setProdiWebList({
        prodi_websites: data.data.prodi_websites || [],
      });
      setIsLoading({ ...isLoading, 3: false })
    } catch (error) {
      setIsLoading({ ...isLoading, 3: false })
      console.error('Error fetching fakultas list:', error);
    }
  };

  const combinedListItems = [
    ...departments.university_websites.map((item, idx) => {
      return {
        id: item._id,
        link: item.link_advice,
        icon: <Globe size={24} />,
        title: item.name || `Item ${idx + 1}`,
        url: item.link || '',
      };
    }),
    ...departments.fakultas_list.map((fakultas, idx) => {
      return {
        id: fakultas.id,
        icon: <Building2 size={24} />,
        title: fakultas.name || `Fakultas ${idx + 1}`,
        url: fakultas.link || '',
        onNewClick: (id) => {
          handleNextCard(2);
          fetchFakultasList(id);
        }
      };
    })
  ];

  const combinedListItemsCard2 = [
    ...fakultasList.fakultas_websites.map((item, idx) => {
      return {
        id: item._id,
        link: item.link_advice,
        icon: <Globe size={24} />,
        title: item.name || `Item ${idx + 1}`,
        url: item.link || '',
      };
    }),

    ...fakultasList.prodi_list.map((item, idx) => {
      return {
        id: item._id,
        icon: <Building2 size={24} />,
        title: item.name || `Item ${idx + 1}`,
        url: item.link || '',
        onNewClick: (id) => {
          handleNextCard(3);
          fetchProdiList(id);
        },
      };
    })
  ];

  const combinedListItemsCard3 = [
    ...prodiWebList.prodi_websites.map((item, idx) => {
      return {
        id: item._id,
        link: item.link_advice,
        icon: <Globe size={24} />,
        title: item.name || `Item ${idx + 1}`,
        url: item.link || '',
      };
    })
  ];

  if (isPageLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Beranda"} />
        <main className="">
          <div
            className={`flex flex-col md:flex-row justify-center ${openCard === 1 || openCard === 2 ? 'flex-col md:flex-row' : 'grid md:grid-cols-3'
              } gap-4 p-4 sm:px-6 sm:py-0`}
          >
            {openCard >= 1 && (
              <Card className="min-w-[320px] max-w-[500px] flex-1">
                <SectionHeader
                  title="Universitas"
                  count={departments.university_websites.length + departments.fakultas_list.length}
                  color="#0B3D91"
                />
                <CardContent className="pt-4">
                  {isLoading[1] ? (
                    <div className="flex h-screen w-full items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                      </div>
                    </div>
                  ) : combinedListItems.length === 0 ? (
                    <p className="text-center text-gray-500">Data tidak ada</p>
                  ) : (
                    combinedListItems.slice(0, openList[1] ? combinedListItems.length : 3).map((item, idx) => (
                      <ListItem
                        key={idx}
                        id={item.id}
                        link={item.link}
                        icon={item.icon}
                        title={item.title}
                        url={item.url}
                        isNew={item.isNew}
                        onNewClick={item.onNewClick}
                        adviceExists={item.adviceExists}
                      />
                    ))
                  )}
                </CardContent>
                {combinedListItems.length > 3 && (
                  <CardFooter>
                    <Button variant="outline" onClick={() => toggleList(1)} className="w-full">
                      {openList[1] ? 'Tutup' : 'Lainnya'} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}

            {openCard >= 2 && (
              <Card className="min-w-[320px] max-w-[500px] flex-1">
                <SectionHeader
                  title="Fakultas"
                  count={combinedListItemsCard2.length}
                  color="#0B3D91"
                />
                <CardContent className="pt-4">
                  {isLoading[2] ? (
                    <div className="flex h-screen w-full items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                      </div>
                    </div>
                  ) : combinedListItemsCard2.length === 0 ? (
                    <p className="text-center text-gray-500">Data tidak ada</p>
                  ) : (
                    combinedListItemsCard2.slice(0, openList[2] ? combinedListItemsCard2.length : 3).map((item, idx) => (
                      <ListItem
                        key={idx}
                        id={item.id}
                        link={item.link}
                        icon={<Building2 size={24} />}
                        title={item.title}
                        url={item.url}
                        isNew={!item.link}
                        onNewClick={item.onNewClick}
                        adviceExists={item.adviceExists}
                      />
                    ))
                  )}
                </CardContent>
                {combinedListItemsCard2.length > 3 && (
                  <CardFooter>
                    <Button variant="outline" onClick={() => toggleList(2)} className="w-full">
                      {openList[2] ? 'Tutup' : 'Lainnya'} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}

            {openCard >= 3 && (
              <Card className="min-w-[320px] max-w-[500px] flex-1">
                <SectionHeader
                  title="Prodi"
                  count={combinedListItemsCard3.length}
                  color="#0B3D91"
                />
                <CardContent className="pt-4">
                  {isLoading[2] ? (
                    <div className="flex h-screen w-full items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                      </div>
                    </div>
                  ) : combinedListItemsCard2.length === 0 ? (
                    <p className="text-center text-gray-500">Data tidak ada</p>
                  ) : (
                    combinedListItemsCard3.slice(0, openList[3] ? combinedListItemsCard3.length : 3).map((item, idx) => (
                      <ListItem
                        key={idx}
                        id={item.id}
                        link={item.link}
                        icon={<Building2 size={24} />}
                        title={item.title}
                        url={item.url}
                        isNew={!item.link}
                        adviceExists={item.adviceExists}
                      />
                    ))
                  )}
                </CardContent>
                {combinedListItemsCard3.length > 3 && (
                  <CardFooter>
                    <Button variant="outline" onClick={() => toggleList(3)} className="w-full">
                      {openList[3] ? 'Tutup' : 'Lainnya'} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
