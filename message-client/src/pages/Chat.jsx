import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import './pages.css'
import { IconButton, Stack } from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import MessageItem from '../components/shared/MessageItem';
import FileMenu from '../components/dialogs/FileMenu';

import { getSocket } from '../utils/socketContext';
import axios from 'axios';
import { server } from '../components/constants/config';
import { ALERT, CHAT_JOINED, CHAT_LEAVED, MARK_MESSAGE_AS_SEEN, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '../components/constants/event'
import { useSocketEvents } from '../hooks/hook';
import { useMyContext } from '../utils/context';
import { useFetchData, useInfiniteScrollTop } from '6pp';
import { CommonLoader, TypingLoader } from '../components/layout/Loaders';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '../lib/Toasting';
import messageSound from '../assets/sound/messageSound.mp3'
import { PulseLoader } from "react-spinners"
import {motion} from "framer-motion"
import { sampleMessage } from '../components/constants/sampleData';
import ChatLayout from '../components/layout/ChatLayout';

const messageTone = new Audio(messageSound)

const Chat = ({ chatId, chatDetails }) => {
  const navigate = useNavigate();
  const socket = getSocket();
  const { myData, newMessageAlert, setNewMessageAlert } = useMyContext()

  const [isFileOpen, setIsFileOpen] = useState(false)
  const [fileMenuAnchor, setFileMenuAnchor] = useState(false)

  const containerRef = useRef(null)
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)

  // const [chatDetails, setChatDetails] = useState({})
  const chatDetailsRef = useRef(chatDetails)

  const [IamTyping, setIamTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const typingTimeout = useRef(null)

  const bottomRef = useRef(null)

  const textareaRef = useRef(null)

  // const fetchChatDetails = async () => {
  //   try {
  //     const { data } = await axios.get(`${server}/api/v1/chat/${chatId}`, { withCredentials: true });
  //     setChatDetails(data.chat);
  //     chatDetailsRef.current = data.chat;
  //   } catch (err) {
  //     notifyError(err.response.data.message || "Something went wrong")
  //   }
  // };

  const cacheKey = `chat_messages_${chatId}_page_${page}`;

  const { data: oldMessagesChunk, error, clearCache,  loading: isMessageloading  } = useFetchData(
    `${server}/api/v1/chat/messages/${chatId}?page=${page}`,
    cacheKey,
    [chatId, page]);

  const { data: oldMessages, setData: setOldMessages} = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk?.totalPages,
    page,
    setPage,
    oldMessagesChunk?.messages
  );

  useEffect(() => {
    if (error) return navigate('/')
  }, [error])

  useEffect(() => {
    // fetchChatDetails();
    setNewMessageAlert(newMessageAlert.filter(item => item.chatId !== chatId));
    clearCache()
    return () => {
      clearCache()
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: myData._id, members: chatDetailsRef.current?.members });
      setUserTyping(false)
    };
  }, [chatId]);

    // all messages to show
  const allMessages = [...oldMessages, ...messages];


  // setting message as seen

  useEffect(() => {
    if (allMessages ) {
      const lastMessageFromOtherUser = allMessages.length > 0 && allMessages[allMessages.length - 1].sender._id !== myData._id;
      
      if(lastMessageFromOtherUser && chatDetails.membersRaw && chatDetails.membersRaw.length > 0){
        socket.emit(MARK_MESSAGE_AS_SEEN , {
          chatId ,
          members: chatDetails.membersRaw,
        })
      }
    }   
  }, [myData._id , chatDetails]);
  


  useEffect(() => {
    if (chatDetails.membersRaw && chatDetails.membersRaw.length > 0) {
      socket.emit(CHAT_JOINED, { userId: myData._id, members: chatDetails.membersRaw });
    }
  }, [chatDetails]);

  const handleMessageInput = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members: chatDetails.membersRaw, chatId });
      setIamTyping(true)
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members: chatDetails.membersRaw, chatId });
      setIamTyping(false)
    }, [2000])

    const scrollHeight = e.target.scrollHeight;

    // Ensure the textarea height doesn't exceed maxHeight
    if (scrollHeight <= 200) { // Adjust this value according to your maxHeight
      e.target.style.height = `${scrollHeight}px`;
    } else {
      e.target.style.height = '200px'; // Set to maxHeight when content exceeds it
      e.target.style.overflowY = 'auto'; // Enable scrollbar
    }
  }



  // socket handling

  const newMessageHandler = useCallback((data) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
      messageTone.play();
  

      // doing this so that real time messages aso become marked as seen
      if( data.message.sender._id !== myData._id && chatDetails.membersRaw && chatDetails.membersRaw.length > 0){
        socket.emit(MARK_MESSAGE_AS_SEEN , {
          chatId ,
          members: chatDetails.membersRaw,
        })
      }
    }
  }, [chatId , chatDetails])

  const startTypingListener = useCallback((data) => {
    if (data.chatId === chatId) {
      setUserTyping(true)
    }
  }, [chatId])

  const stopTypingListener = useCallback((data) => {
    if (data.chatId === chatId) {
      setUserTyping(false)
    }
  }, [chatId])

  const alertListener = useCallback((data) => {
    if (data.chatId === chatId) {
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "randomIdCauseThisIsNotImportant",
          name: "admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, messageForAlert])
    }
  }, [chatId])

  const messageSeenListener = useCallback((data) => {
    if (data.chatId === chatId) {
     setOldMessages(prev =>{
        const updatedMessages = prev.map(msg=>{
          if(!msg.seen){
            return{
              ...msg,
              seen: true,
            }
          }
          return msg
        });
      return updatedMessages
     });

     setMessages(prev =>{
      const updatedMessages = prev.map(msg=>{
        if(!msg.seen){
          return{
            ...msg,
            seen: true,
          }
        }
        return msg
      });
    return updatedMessages
   });
    }
  }, [chatId])

  const eventHandler = {
    [NEW_MESSAGE]: newMessageHandler,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [ALERT]: alertListener,
    [MARK_MESSAGE_AS_SEEN]: messageSeenListener,
  }

  useSocketEvents(socket, eventHandler)

  const submitHandler = (e) => {
    e.preventDefault()
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return notifyError('no message');
    socket.emit(NEW_MESSAGE, { chatId, members: chatDetails.membersRaw, message: trimmedMessage });
    setMessage("");
    setUserTyping(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

  }



  // scrolling to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, ])

  return (
    <>
      <motion.div
        ref={containerRef}
        // boxSizing={"border-box"}
        // padding={"1rem"}
        // spacing={"1rem"}
        // bgcolor={'#fcfffa'}
        style={{
          overflowX: "hidden",
          overflowY: "auto",
          flex: '.9',
          display:'flex',
          flexDirection:'column',
          padding:'1rem'
        }}
      >
        {
          oldMessagesChunk?.totalPages !== page 
          &&
          <CommonLoader />
        }
        
        {
          allMessages.map((msg, index) => { 
            const prevMsg = allMessages[index - 1];
            const sameSenderAsPrevious = prevMsg && prevMsg.sender._id === msg.sender._id;
          

            return <MessageItem key={msg._id} message={msg} user={myData} chatDetails={chatDetails} sameSenderAsPrevious={sameSenderAsPrevious}/>
          })
        }
  
        {
          userTyping && <PulseLoader color="#c2f09d" />
        }
        <div ref={bottomRef} />
      </motion.div>
      <form
        style={{
          flex: '.1'
        }}
        onSubmit={(e) => submitHandler(e)}
      >
        <Stack
          direction={'row'}
          padding={'.1rem'}
          alignItems={'center'}
          justifyContent={'center'}
          position={'relative'}
          height={'100%'}
          bgcolor='#1D546C'
        >
          <IconButton
            position={'absolute'}
            onClick={(e) => {
              setIsFileOpen((prev) => !prev);
              setFileMenuAnchor(e.currentTarget)
            }}
          >
            <AttachFileIcon />
          </IconButton>
          <textarea onChange={(e) => handleMessageInput(e)} spellCheck='false' value={message} name="message" placeholder='Type message...' id="" className="chat-input" style={{
              minHeight: '20px', // Set a minimum height
              maxHeight: '80px', // Set the maximum height
              height: 'auto', // Ensure the height adjusts automatically based on content
              resize: 'none', // Disable textarea resizing by user
            }}
            ref={textareaRef}
            ></textarea>
          <motion.button
            whileTap={{scale:.9 , rotate: '15deg'}}
            whileHover={{scale:1.1 , rotate: '-5deg'}}
            
            type="submit"
            style={{
              rotate: "-30deg",
              backgroundColor: '#0C2B4E',
              color: "white",
              marginLeft: "1rem",
              padding: ".3rem",
              height:'36px',
              width:"36px",
              display:"grid",
              placeItem:'center',
              border:'none',
              borderRadius:"50%"
            }}
          >
               <SendIcon />
          </motion.button>

          <FileMenu chatId={chatId} isFileOpen={isFileOpen} setIsFileOpen={setIsFileOpen} anchorE1={fileMenuAnchor} />
        </Stack>
      </form>
    </>
  );

};

export default ChatLayout()(Chat);
