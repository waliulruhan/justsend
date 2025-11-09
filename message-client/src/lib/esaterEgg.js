import { toast } from 'react-hot-toast'
import happySound from '../assets/sound/happyHappyHappyMusic.mp3'

// adding some simple estereggs

const MessageItemEasterEgg = (message) =>{

    // happy happy sound
    if(message === 'happy happy happy'){
        const audio = new Audio(happySound)
        audio.play()
        toast('happy happy happy')
    }

}

export {
    MessageItemEasterEgg
};