import React, { Suspense, lazy, memo, useEffect, useState } from 'react';
import './pages.css'
import { Backdrop, Box, Drawer, IconButton, Stack, Tooltip } from '@mui/material';
import { Add, Delete, Done, Edit, KeyboardBackspace, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { samepleChats, sampleUsers } from '../components/constants/sampleData';
import AvatarCard from '../components/shared/AvatarCard';
import UserItem from '../components/shared/UserItem';
import { server } from '../components/constants/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAsyncMutation } from '../hooks/hook';
import { notifyError } from '../lib/Toasting';
import { ScaleLoader } from 'react-spinners';
import { CommonLoader } from '../components/layout/Loaders';
const ConfirmDialog =lazy(()=> import('../components/dialogs/ConfirmDialog')) 
const AddMemberDialog  =lazy(()=> import('../components/dialogs/AddMemberDialog')) 
const Groups = () => {

    
    const chatId = useSearchParams()[0].get("group")
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [isAddMember , setIsAddMember]  =useState(false)
    
    const [isEdit, setIsEdit] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDetails, setGroupDetails] = useState([]);
    const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");

    
    const { data, error, isLoading, isError , refetch } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await axios.get(`${server}/api/v1/chat/mygroups`, { withCredentials: true });
            return res.data.groups;
        },
    });    
    const fetchGroupDetails = async () => {
        try {
          // setLoading(true)
          const { data } = await axios.get(`${server}/api/v1/chat/${chatId}?populate=true`, { withCredentials: true });
          setGroupDetails(data.chat);
          setGroupName(data.chat.name)
          setGroupNameUpdatedValue(data.chat.name)
        } catch (error) {
            notifyError(error.response.data.message || "Something went wrong")
        } finally {
          // setLoading(false);
        }
      };


    useEffect(()=>{

       if(chatId) fetchGroupDetails()

        return ()=>{
            setGroupName("");
            setGroupNameUpdatedValue("");
            setIsEdit(false);
            setGroupDetails([])
          }
    },[chatId])
    
    useEffect(()=>{
        if(chatId) fetchGroupDetails()
     },[chatId , data])






    //mutations---

    const removeMemberMutation = useMutation({
        mutationFn: async(userId) => {
           const { data } = await axios.put(`${server}/api/v1/chat/removemember`,{chatId , userId}, { withCredentials: true });
           refetch()
           return data
        },
      })

    const renameGroupMutation = useMutation({
        mutationFn: async (name) => {
              const { data } = await axios.put(`${server}/api/v1/chat/${chatId}`,{name}, { withCredentials: true });
              refetch()
              return data
            }
    })  
    const deleteGroupMutation = useMutation({
        mutationFn: async () => {
              const { data } = await axios.delete(`${server}/api/v1/chat/${chatId}`,{ withCredentials: true });
              refetch()
              navigate('/groups')
              setConfirmDeleteDialog(false)
              return data
            }
    })  



    const [ executeRemoveMember, isRemovingMember ] = useAsyncMutation(removeMemberMutation);
    const [ executeRenameGroup, isRenamingGroup ] = useAsyncMutation(renameGroupMutation);
    const [ executeDeleteGroup, isDeletingGroup ] = useAsyncMutation(deleteGroupMutation);


    const deleteHandler=()=>{
        executeDeleteGroup("deleting group...")
        refetch()
    }
  
    const removeFriendHandler =(id)=>{
        executeRemoveMember("Removing member...", id);
    }


    const groupNameUdateHandler = async () => {
        if (!groupNameUpdatedValue) {
            notifyError("Group name is required");
            return;
        }
        executeRenameGroup("Renaming group..." , groupNameUpdatedValue)
        setIsEdit(false)
      };
      

    const IconBtns = (
        <div style={{height:"20px"}}>
            <Box
                sx={{
                    display: {
                        xs: "block",
                        sm: "none",
                        position: "fixed",
                        right: "1rem",
                        top: "1rem",
                    },
                }}
            >
                <IconButton onClick={() => setIsMobileMenuOpen(true)}>
                    <MenuIcon />
                </IconButton>
            </Box>

            <Tooltip title="back">
                <IconButton
                    sx={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        bgcolor: "#447515",
                        color: "white",
                        ":hover": {
                            bgcolor: "#66a22e",
                        },
                    }}
                    onClick={() => navigate('/')}
                >
                    <KeyboardBackspace />
                </IconButton>
            </Tooltip>
        </div>
    );



  const GroupName = (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"center"}
      spacing={"1rem"}
      sx={{
        padding:'2.5rem 2.5rem 1rem 2.5rem',

      }}
      width={'100%'}
    >
      {isEdit ? (
        <>
        <div      className='input-div'>
          <input
          className='input-field'
            value={groupNameUpdatedValue}
            onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
          />
          <IconButton onClick={groupNameUdateHandler} disabled={isRenamingGroup} >
            <Done />
          </IconButton>
        </div>
        </>
      ) : (
        <>
          <h4>{groupName}</h4>
          <IconButton
            onClick={() => setIsEdit(true)}
            disabled={isRenamingGroup}
          >
            <Edit />
          </IconButton>
        </>
      )}
    </Stack>
  );
    return (
        <div className='groups'>
            <div className="groups-list">
             {
                isLoading ? <CommonLoader/>
                :
                <GroupList chatId={chatId} myGroups={data}/>
               }
            </div>
            <div className="groups-main">
                {IconBtns}
                {chatId && GroupName}
                {chatId ?
                    <div className="group-members">
                        {!groupDetails.members? <CommonLoader/> :
                        groupDetails?.members.map((i) => (
                            <UserItem
                            user={i}
                            key={i._id}
                            handler={removeFriendHandler}
                            isAdded={true}
                            handlerIsLoading={isRemovingMember}
                            />
                        ))
                        }
                    </div> 
                    
                    :
                  <p>Choose group</p>    
                }
                
               {chatId && <div className="group-button">
                    <button className="custom-button"  onClick={()=>{ setIsAddMember(true)}} >
                        <Add  fontSize='small'/>Add member
                    </button>
                    <button className="error-button" onClick={()=> setConfirmDeleteDialog(true)}>
                        <Delete fontSize='small' />Delete group
                    </button>
                </div>}

                
            </div>
                <Drawer
                    sx={{
                        display: {
                            xs: "block",
                            sm: "none",
                        },
                    }}
                    open={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                {
                    isLoading ? <CommonLoader /> 
                    :
                    <GroupList chatId={chatId} myGroups={data} w={'50vw'}/>
                }
                </Drawer>
                {
                    confirmDeleteDialog && <Suspense fallback={<Backdrop open/>}>
                        <ConfirmDialog
                            open={confirmDeleteDialog}
                            handleClose={setConfirmDeleteDialog}
                            handler={deleteHandler}
                            header='Detele Group'
                            content='Are you sure?'
                        />
                    </Suspense>
                }
                {
                   isAddMember  && <Suspense fallback={<Backdrop open/>}>
                        <AddMemberDialog
                            chatId={chatId}
                            open={isAddMember}
                            handleClose={setIsAddMember}
                            fetchGroupDetails={fetchGroupDetails}
                        />
                    </Suspense>
                }
        </div>
    );
};

const GroupList = ({ w = '100%', myGroups = [], chatId }) => {
    return <Stack
        width={w}
        sx={{
            backgroundColor: '#f7fdf0',
            height: '100dvh',
            overflow: 'auto',
        }}
    >
        {
            myGroups.length > 0 ? (
                myGroups.map((group) => {
                    return <GroupItem group={group} key={group._id} chatId={chatId} />
                })
            ) : (
                <p>No groups</p>
            )

        }
    </Stack>
}

const GroupItem = memo(({group , chatId}) => {
    const navigate = useNavigate()
    const {name , avatar , _id} = group;
    const sameGroup = chatId === _id
    return <div

        onClick={() => {
            if(!sameGroup){
                navigate(`/groups/?group=${_id}`)
            }
        }}
        style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            backgroundColor: sameGroup ? "#c8d2bb" : "unset",
            color: sameGroup ? "white" : "unset",
            position: "relative",
            padding: "1rem",
        }}
    >
        <AvatarCard avatar={avatar} />

        <p>{name}</p>

    </div>
})

export default Groups;