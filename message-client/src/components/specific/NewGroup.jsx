import { Dialog, Stack } from '@mui/material';
import React, { useState } from 'react';
import { useMyContext } from '../../utils/context';
import { sampleNotifications, sampleUsers } from '../constants/sampleData';
import NotificationItem from '../shared/NotificationItem';
import './specific.css';
import UserItem from '../shared/UserItem';
import { useFetchData, useInputValidation } from '6pp';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Avatar, IconButton } from '@mui/material';
import { Close, Done, FamilyRestroomOutlined } from '@mui/icons-material';
import { server } from '../constants/config';
import { notifyError, notifySuccess } from '../../lib/Toasting';

const NewGroup = () => {
    const { isNewGroup, setIsNewGroup } = useMyContext()
    const groupName = useInputValidation("");

    const [selectedMembers, setSelectedMembers] = useState([]);
    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id)
                ? prev.filter((currElement) => currElement !== id)
                : [...prev, id]
        );
    };
    const dialogStyle = {
        maxHeight: "90vh",
        maxWidth: '100vw',
        backgroundColor: '#eff9e8',
        overflow: 'hidden',
    };

    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => {
            const res = await axios.get(`${server}/api/v1/user/friends`, { withCredentials: true });
            return res.data.friends;
        },
    });
    
    const createGroupHandler = async ()=>{
        if (!groupName.value) {
            notifyError("Group name is required");
            return;
        }
        if (selectedMembers.length  < 2) {
            notifyError("At least two member must be selected");
            return;
        }
        try {
            const { data } = await axios.post(
                `${server}/api/v1/chat/new`,
                {
                    name: groupName.value,
                    members: selectedMembers
                },
                {
                    withCredentials: true
                }
            );
    
            notifySuccess(data.message);
            setIsNewGroup(false)

        } catch (error) {
            notifyError(error.response.data.message);
        } 
    }

    return (
        <Dialog
            PaperProps={{ sx: dialogStyle }}
            open={isNewGroup}
            onClose={() => setIsNewGroup(false)}
        >
            <Stack bgcolor='#eff9e8' textAlign={'center'} justifyContent={'start'} alignItems={'center'} p={'1rem'} direction={'column'}>
                <p className="dialog-header">New Group</p>
                <div className="input-div">
                    <input
                        className='input-field'
                        placeholder='Group name'
                        type="text"
                        value={groupName.value}
                        onChange={groupName.changeHandler}
                    />
                </div>
                <div className="dialog-user-list">
                    {isLoading ? (
                        <h1>Loading...</h1>
                    ) : isError ? (
                        <h1>An error occurred: {error.message}</h1>
                    ) : !data || data.length === 0 ? (
                        <h1>No friends found</h1>
                    ) : (
                        data.map((user) => (
                            <UserItem
                                user={user}
                                key={user._id}
                                isAdded={selectedMembers.includes(user._id)}
                                handler={selectMemberHandler}
                            />
                        ))
                    )}
                </div>
                <Stack textAlign={'center'} justifyContent={'center'} alignItems={'center'} p={'1rem'} width={'70vw'} direction={'row'}>
                    <IconButton
                        size="small"
                        sx={{
                            bgcolor: "#66a22e",
                            color: "white",
                            "&:hover": {
                                bgcolor: "#447515",
                            },
                        }}
                        onClick={() => createGroupHandler()}
                    >
                        <Done />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": {
                                bgcolor: "error.dark",
                            },
                            marginLeft: '15px'
                        }}
                        onClick={() => setIsNewGroup(false)}
                    >
                        <Close />
                    </IconButton>
                </Stack>
            </Stack>


        </Dialog>
    );
};

export default NewGroup;