console.log('let go JavaScript');
let currentSong = new Audio(); // global currentSong tracker
let songs; // globally declare variable for storing all songs
let currFolder;
let albums = [];
let currAlbumIndex = 0;

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`); // waiting for the songs list to fetch
    let response = await a.text(); // waiting for the response to get updated with a.text format of songs list
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
            if(element.href.endsWith(".mp3")){
                songs.push(decodeURIComponent(element.href.split("/").pop().replace(".mp3", "")));
            }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                                <img class="invert" src="svgs/music.svg" alt="">
                                <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Song Artist Name</div>
                                </div>
                                <div class="playnow">
                                <img class="invert" src="svgs/play.svg" alt="">
                                </div>
                             </li>`;
    }
    
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click",()=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()); // trim use to remove the spaces
            play.src = "svgs/pause.svg";
        });
    });
    if(songs.length == 0){
        document.querySelector(".songList").getElementsByTagName("ul")[0].innerHTML = "No songs in this PlayList 🙁";
        throw new Error("no songs list found");
    }

    return songs;
}

function secToMin(x){
    if(isNaN(x) || x<0){
        return "00:00";
    }
    const minutes = Math.floor(x / 60);
    const seconds = Math.floor(x % 60);
    return (minutes +':'+seconds.toString().padStart(2, '0'));
}

const playMusic=(audio,pause=false)=>{
    currentSong.src = `${currFolder}/${audio}.mp3`;
    if(!pause){
        currentSong.play();
        play.src = "svgs/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(audio); // decodeURI decodes the uncoded text
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs`); // waiting for the songs list to fetch
    let response = await a.text(); // waiting for the response to get updated with a.text format of songs list
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    albums = [];
    for (let i = 0; i < (Array.from(anchor)).length; i++) {
        const e = (Array.from(anchor))[i];
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-2)[1];
            albums.push(folder);
            // getting metaData from json files
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json(); // return object     
            document.querySelector(".cardContainer").innerHTML += `<div data-folder="${folder}" class="card rounded">
            <figure>
            <svg class="play" data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>                  
            <img class="rounded" src="songs/${folder}/cover.jpg" alt="card">
            </figure>
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`
        }
    };
    // load playlist on clicking any albums
    Array.from(document.getElementsByClassName("card")).forEach(e =>{
        e.addEventListener("click",async item=>{
            currAlbumIndex = albums.indexOf(item.currentTarget.dataset.folder);
            try{
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            }catch (err) {
                console.log(err.message);
            }
        })
    });   
}

albumPrev.addEventListener("click",async ()=>{
    if (currAlbumIndex > 0) {
        currAlbumIndex--;
    } else {
        alert("No previous album");
        return;
    }
    let folder = albums[currAlbumIndex];
    songs = await getSongs(`songs/${folder}`);
    playMusic(songs[0]);
});

albumNext.addEventListener("click",async ()=>{
    if(currAlbumIndex < albums.length){
        currAlbumIndex++;
    }else{
        alert("No next albums");
        return;
    }
    let folder = albums[currAlbumIndex];
    songs = await getSongs(`songs/${folder}`);
    playMusic(songs[0]);
})
async function main(){
    // getting all the songs
    await getSongs("songs/Angry_(mood)/");
    // initial song
    playMusic(songs[0],true);

    // displaying all the albums
    displayAlbums();
    
    prev.addEventListener("click",()=>{
        play.src = "svgs/pause.svg";
        // console.log(currentSongName);
        let index = songs.indexOf(decodeURI(currentSong.src.split('/').pop()).split('.mp3')[0])
        // let index = songs.indexOf(currentSongName);
        if(index-1 >= 0){
            playMusic(songs[index-1]);
        }
        else{
            alert("No previous song found !!!");
            currentSong.pause();
            play.src = "svgs/play.svg";
        }
    });

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "svgs/pause.svg";
            
        }
        else{
            currentSong.pause();
            play.src = "svgs/play.svg";
        }
    });
    
    next.addEventListener("click",()=>{
        play.src = "svgs/pause.svg";
        let index = songs.indexOf(decodeURI(currentSong.src.split('/').pop()).split('.mp3')[0])
        // let index = songs.indexOf(currentSongName);
        if(index+1 <= songs.length-1){
            playMusic(songs[index+1]);
        }
        else{
            alert("No next song found !!!");
            currentSong.pause();
            play.src = "svgs/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songDuration").innerHTML = `${secToMin(currentSong.currentTime)} / ${secToMin(currentSong.duration)}` 
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    });
    
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        const varWidth = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = (varWidth)*100 + "%";
        currentSong.currentTime = currentSong.duration * varWidth;
        // console.log(e.target.getBoundingClientRect(),e); // get the coordinate of all attributes when clicked
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = 0;
    })
    
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = -120 + '%';
    })

    document.querySelector(".volumebar").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = 1;
        currentSong.volume = (e.target.value)/100;
        if ((e.target.value)/100 === 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svgs/mute.svg";
        } else if ((e.target.value)/100 < 0.5) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svgs/low_volume.svg";
        } else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svgs/high_volume.svg";
        }
    });
    
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        let x = document.querySelector(".volumebar").getElementsByTagName("input")[0];
        if(e.target.src.includes("svgs/high_volume.svg") || e.target.src.includes("svgs/low_volume.svg")){
            if((x.value)/100 < 0.5){
                e.target.src = e.target.src.replace("svgs/low_volume.svg","svgs/mute.svg");
            }
            else{
                e.target.src = e.target.src.replace("svgs/high_volume.svg","svgs/mute.svg");
            }
            document.querySelector(".volumebar").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        }
        else{
            e.target.src = e.target.src.replace("svgs/mute.svg","svgs/low_volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".volumebar").getElementsByTagName("input")[0].value = 10;
        }
    });
} 
main();