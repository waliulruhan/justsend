import { ListItemText, Menu, MenuItem, MenuList, Tooltip } from "@mui/material";import React, { useRef } from 'react';
import {
    AudioFile as AudioFileIcon,
    Image as ImageIcon,
    UploadFile as UploadFileIcon,
    VideoFile as VideoFileIcon,
  } from "@mui/icons-material";
import axios from "axios";
import { server } from "../constants/config";
import {notifyError , notifySuccess} from '../../lib/Toasting.jsx';
import { toast } from "react-hot-toast";

const FileMenu = ({anchorE1, isFileOpen , setIsFileOpen, chatId}) => {

    const imageRef = useRef(null);
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const fileRef = useRef(null);


  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  const uploadAttachments = async(files)=>{
    const { data } = await axios.post(`${server}/api/v1/chat/message` , files , { withCredentials: true });
    return data
  }

  const fileChangeHandler = async (e, key) => {
     const files = Array.from(e.target.files);

    if (files.length <= 0) return;

    if (files.length > 20)
       notifyError(`You can only send 20 ${key} at a time`);

    setIsFileOpen(false)

    try {
      const toastId = toast.loading(`Sending ${key}..`)
      const myForm = new FormData();

      myForm.append("chatId", chatId);
      files.forEach((file) => myForm.append("files", file));

      const res = await uploadAttachments(myForm);
    
      if (res.success) notifySuccess(`${key} sent successfully` , {
        id: toastId,
      });
      else notifyError(`Failed to send ${key}`);

      
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };
    return (
        <Menu anchorEl={anchorE1} open={isFileOpen} onClose={()=> setIsFileOpen(false)}>
            <div
                style={{
                    width:"10rem"
                }}
            >
                 <MenuList>
          <MenuItem onClick={selectImage}>
            <Tooltip title="Image">
              <ImageIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Image</ListItemText>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Images")}
              ref={imageRef}
            />
          </MenuItem>

          <MenuItem onClick={selectAudio}>
            <Tooltip title="Audio">
              <AudioFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Audio</ListItemText>
            <input
              type="file"
              multiple
              accept="audio/mpeg, audio/wav"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Audios")}
              ref={audioRef}
            />
          </MenuItem>

          <MenuItem onClick={selectVideo}>
            <Tooltip title="Video">
              <VideoFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Video</ListItemText>
            <input
              type="file"
              multiple
              accept="video/mp4, video/webm, video/ogg"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Videos")}
              ref={videoRef}
            />
          </MenuItem>

          <MenuItem onClick={selectFile}>
            <Tooltip title="File">
              <UploadFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>File</ListItemText>
            <input
              type="file"
              multiple
              accept="*"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Files")}
              ref={fileRef}
            />
          </MenuItem>
        </MenuList>
            </div>
        </Menu>
    );
};

export default FileMenu;