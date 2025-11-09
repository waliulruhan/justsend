import { toast } from "react-hot-toast";

// handling sounds 
import errorSound from "../assets/sound/errorSound.mp3"
import successSound from "../assets/sound/successSound.mp3"

const errorTone = new Audio(errorSound)
const successTone = new Audio(successSound)

const notifyError =(text , {id} = {})=>{
  errorTone.play()
  const toastId =  toast((t) => {
        return <span>
            {text}
      </span>
    },{ 
        id : id || 'randomId',
        style:{
          border: '1px solid rgb(160, 184, 139)',
          backgroundColor: '#d6f0bf',
          color: '#101f03',
          fontWeight: 500,
        },
        duration: 1500,
 });    
}

const notifySuccess =(text , {id} = {} )=>{
  successTone.play()
  const toastId =  toast((t) => {
        return <span>
            {text}
      </span>
    },{ 
        id : id || 'randomId',
        style:{
          border: '1px solid rgb(160, 184, 139)',
          backgroundColor: '#d6f0bf',
          color: '#101f03',
          fontWeight: 500,
        },
        duration: 1500,
 });    
}

export {
    notifyError,
    notifySuccess,
}