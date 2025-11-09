import React, { useState } from 'react';
import { Dialog, IconButton, Stack } from '@mui/material';
import { Close, Done, SearchOutlined } from '@mui/icons-material';
import '../specific/specific.css'
import UserItem from '../shared/UserItem';
import { useInputValidation } from '6pp';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAsyncMutation, useErrors } from '../../hooks/hook';
import axios from 'axios';
import { server } from '../constants/config';
import {notifyError} from '../../lib/Toasting'
import { CommonLoader } from '../layout/Loaders';
const AddMemberDialog = ({ open, handleClose, chatId , fetchGroupDetails }) => {
    const search = useInputValidation("");
    const [selectedMembers, setSelectedMembers] = useState([]);




    const { data, error, isLoading, isError , refetch } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => {
            const res = await axios.get(`${server}/api/v1/user/friends?chatId=${chatId}`, { withCredentials: true });
            return res.data.friends;
        },
    });

    const addMembersMutation = useMutation({
        mutationFn: async ({chatId , members}) => {
              const { data } = await axios.put(`${server}/api/v1/chat/addmembers`,{chatId , members}, { withCredentials: true });
              refetch()
              fetchGroupDetails()
              return data
            }
    })  



    const [ executeAddMembers, isAddingingMembers ] = useAsyncMutation(addMembersMutation);

    const errors =[
        {
            isError,
            error,
        }
    ]
    useErrors(errors)
 

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) =>
          prev.includes(id)
          ? prev.filter((currElement) => currElement !== id)
          : [...prev, id]
          );
        };
        

        
        const addMembersHandler = () =>{
            if(selectedMembers.length < 1 ) return notifyAlery("add atleast 1 friend")

            executeAddMembers("Adding members.." , {chatId , members: selectedMembers})

        }
        
        
        
        
        const dialogStyle = {
            maxHeight: "100dvh",
            maxWidth: '100vw',
        };
    return (
        <Dialog
            PaperProps={{ sx: dialogStyle }}
            open={open}
            onClose={() => handleClose(false)}
        >
            <Stack textAlign={'center'}  bgcolor='#eff9e8'  justifyContent={'start'} alignItems={'center'} p={'1rem'} direction={'column'}>
                <p className="dialog-header">Add member</p>
                <div className="dialog-input flex-con">
                    <SearchOutlined />
                    <input
                        placeholder='search with email'
                        type="text"
                        value={search.value}
                        onChange={search.changeHandler}
                    />
                </div>
                <div className="dialog-user-list">
                    {
                        isLoading ? <CommonLoader/> :(
                        data?.length > 0 ?
                            data?.map((i) => {
                                return <UserItem
                                    user={i}
                                    key={i._id}
                                    handler={selectMemberHandler}
                                    isAdded={selectedMembers.includes(i._id)}
                                    handlerIsLoading={isAddingingMembers}
                                />
                            })
                            :
                            <p>No friends</p>)
                    }
                </div>
                <div className='flex-con' style={{ flexGrow: 1 }}>
                    <IconButton
                        disabled={isAddingingMembers}
                        size="small"
                        sx={{
                            bgcolor: "#66a22e",
                            color: "white",
                            "&:hover": {
                                bgcolor: "#447515",
                            },
                        }}
                        onClick={() => addMembersHandler()}
                    >
                        <Done />
                    </IconButton>
                    <IconButton
                        disabled={isAddingingMembers}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": {
                                bgcolor: "error.dark",
                            },
                            marginLeft: '15px'
                        }}
                        onClick={() => handleClose(false)}
                    >
                        <Close />
                    </IconButton>
                </div>
            </Stack>
        </Dialog>
    );
};

export default AddMemberDialog;