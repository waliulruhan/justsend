const fileFormat =(url='')=>{
    const fileExtentation = url.split('.').pop();

    if(fileExtentation ===  'mp4' || fileExtentation === 'webn'  || fileExtentation=== 'ogg' ){
        return 'video'
    }
    if(fileExtentation ===  'mp3' || fileExtentation === 'wav' ){
        return 'audio'
    }
    if(fileExtentation ===  'png' || fileExtentation === 'jpg'  || fileExtentation=== 'jpeg' || fileExtentation=== 'gif' ){
        return 'image'
    }
    return 'file'

}

const getOrSaveFromStorage = ({key , value , get})=>{
    if (get){
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
        }
  else localStorage.setItem(key, JSON.stringify(value));
}

const transformImage=(url="",width="200")=>{
    const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);
    return newUrl;
}
export { fileFormat, transformImage  , getOrSaveFromStorage}