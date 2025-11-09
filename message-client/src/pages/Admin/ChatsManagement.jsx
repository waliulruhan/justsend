import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Avatar, Stack } from '@mui/material';
import AvatarCard from '../../components/shared/AvatarCard'
import { dashboardData } from '../../components/constants/sampleData';
import { transformImage } from '../../lib/features';
import Table from '../../components/shared/Table';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../../components/constants/config';
import { useErrors } from '../../hooks/hook';
import { CommonLoader } from '../../components/layout/Loaders';
const ChatsManagement = () => {

const columns = [
    {
      field: "id",
      headerName: "ID",
      headerClassName: "table-header",
      width: 200,
    },
    {
      field: "avatar",
      headerName: "Avatar",
      headerClassName: "table-header",
      width: 150,
      renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
    },
  
    {
      field: "name",
      headerName: "Name",
      headerClassName: "table-header",
      width: 300,
    },
  
    {
      field: "groupChat",
      headerName: "Group",
      headerClassName: "table-header",
      width: 100,
    },
    {
      field: "totalMembers",
      headerName: "Total Members",
      headerClassName: "table-header",
      width: 120,
    },
    {
      field: "members",
      headerName: "Members",
      headerClassName: "table-header",
      width: 400,
      renderCell: (params) => (
        <AvatarCard max={100} avatar={params.row.members} />
      ),
    },
    {
      field: "totalMessages",
      headerName: "Total Messages",
      headerClassName: "table-header",
      width: 120,
    },
    {
      field: "creator",
      headerName: "Created By",
      headerClassName: "table-header",
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={"1rem"}>
          <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
          <span>{params.row.creator.name}</span>
        </Stack>
      ),
    },
  ];

  document.title = "Chats"
  const { data, error, isLoading, isError , refetch } = useQuery({
    queryKey: ['dashboard-chats'],
    queryFn: async () => {
        const res = await axios.get(`${server}/api/v1/admin/chats`, { withCredentials: true });
        return res.data;
    },
  });

  useErrors([
    {
      isError: isError,
      error: error,
    },
  ]);


  const [rows, setRows] = useState([]);
  useEffect(()=>{
    if(data?.chats){
      setRows(
        data?.chats.map((i) => ({
            ...i,
            id: i._id,
            avatar: i.avatar.map((i) => transformImage(i, 50)),
            members: i.members.map((i) => transformImage(i.avatar, 50)),
            creator: {
              name: i.creator.name,
              avatar: transformImage(i.creator.avatar, 50),
            },
          }))
    ) 
    }
  },[data])
    return (
        <AdminLayout>
          {isLoading ? <CommonLoader/> 
          :
          <Table heading={"All Chats"} columns={columns} rows={rows} />
          }
        </AdminLayout>
    );
};

export default ChatsManagement;