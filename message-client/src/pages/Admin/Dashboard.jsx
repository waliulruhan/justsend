import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css'
import Chart from 'chart.js/auto'
import { Bar, Doughnut } from 'react-chartjs-2';
import { useFetchData } from '6pp';
import { server } from '../../components/constants/config';
import { useErrors } from "../../hooks/hook"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutLoader } from '../../components/layout/Loaders';

const Dashboard = () => {
  document.title = "Admin Dashboard"
    const { data, error, isLoading, isError , refetch } = useQuery({
      queryKey: ['dashboard-stats'],
      queryFn: async () => {
          const res = await axios.get(`${server}/api/v1/admin/stats`, { withCredentials: true });
          return res.data;
      },
  });
    const { stats } = data || {};

    useErrors([
      {
        isError: isError,
        error: error,
      },
    ]);

    const doughnutData = {
        labels: [
          'Group chat',
          'Single chat',
        ],
        datasets: [{
          label: 'count',
          data: [stats?.groupsCount, stats?.totalChatsCount - stats?.groupsCount],
          backgroundColor: [
            '#c2f09d',
            '#7dea7d'
          ],
          hoverOffset: 4
        }]
      };

      const barData = {
        labels: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thirsday','Friday'],
        datasets: [{
          label: 'Messages',
          data: [65, 59, 80, 81, 564, 55, 40],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 2
        }]
      };
      
    return isLoading ? <LayoutLoader/> :(
        <AdminLayout>
            <div className='dashboard' >
                <div className="charts">
                  <div className="chart">
                    <Doughnut data={doughnutData} />
                  </div>
                  <div className="chart">
                    <Bar
                        data={barData}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                            yAxes: [{
                                ticks: {
                                beginAtZero: true,
                                },
                            }],
                            },
                        }}
                        />
                  </div>


                </div>
                <div className="widgets">
                    <div className="widget flex-con">
                        <div  className="flex-con">
                            <p>{stats?.usersCount}</p>
                        </div>
                        <p>Total users</p>
                    </div>
                    {/* <div className="widget">
                        <div  className="flex-con">
                            <p>100</p>
                        </div>
                        <p>Active</p>
                    </div> */}
                    <div className="widget">
                        <div  className="flex-con">
                            <p>{stats?.totalChatsCount}</p>
                        </div>
                        <p>Total chats</p>
                    </div>
                    <div className="widget">
                        <div  className="flex-con">
                            <p>{stats?.messagesCount}</p>
                        </div>
                        <p>Messages</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;