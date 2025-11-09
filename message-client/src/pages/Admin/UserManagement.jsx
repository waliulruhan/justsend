import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Avatar } from '@mui/material';
import { dashboardData } from '../../components/constants/sampleData';
import { transformImage } from '../../lib/features'
import Table from '../../components/shared/Table';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../../components/constants/config';
import { useErrors } from '../../hooks/hook';
import { CommonLoader } from '../../components/layout/Loaders';

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
      renderCell: (params) => (
        <Avatar alt={params.row.name} src={params.row.avatar} />
      ),
    },
  
    {
      field: "name",
      headerName: "Name",
      headerClassName: "table-header",
      width: 200,
    },
    {
      field: "username",
      headerName: "Username",
      headerClassName: "table-header",
      width: 200,
    },
    {
      field: "friends",
      headerName: "Friends",
      headerClassName: "table-header",
      width: 150,
    },
    {
      field: "groups",
      headerName: "Groups",
      headerClassName: "table-header",
      width: 200,
    },
  ];

const UserManagement = () => {
  document.title = "User"
  const { data, error, isLoading, isError , refetch } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
        const res = await axios.get(`${server}/api/v1/admin/users`, { withCredentials: true });
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
    if(data?.users){    
      setRows(
         data?.users.map(i=>({
              ...i,
              id: i._id,
              avatar: transformImage(i.avatar,50)
          }))
      )
    }
  },[data])
    return (
        <AdminLayout>
          {isLoading ? <CommonLoader/>
          :
                <Table heading={"All users"} rows={rows} columns={columns}/>
          } 
        </AdminLayout>
    );
};

export default UserManagement;