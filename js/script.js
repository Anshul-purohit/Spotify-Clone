let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Ensure seconds is a positive number
    seconds = Math.max(0, seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad single-digit minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds in "MM:SS" format
    const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

    return formattedTime;
}

// // Example usage:
// const totalSeconds = 75; // Replace this with the desired number of seconds
// const formattedTime = formatTime(totalSeconds);
// console.log(formattedTime);  // Output: "01:15"


async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    
    let as = div.getElementsByTagName("a")
    songs = []
    for(let index=0;index<as.length;index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ").replaceAll("%5B", "").replaceAll("%5D", "").replaceAll("%26", " ")}</div>
                                <div>Anshul</div>
                            </div>
                            <img class="invert playnow" src="images/play.svg" alt="">
                        </li>`;
    }

    // Attach an event listener to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}

const playMusic = (track,pause) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for(let index=0;index<array.length;index++){
        const e = array[index]
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            // console.log(folder)
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <div class="p"style="width: 40px; height: 40px; background-color: #00FF00; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#141B34" stroke-width="1.5"/>
                        <path d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>                                                                     
            </div>                      
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click",async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main(){ 

    // Get the list of all the songs
    await getSongs("Songs/AnuvJain")
    playMusic(songs[0],true)
  
   // Display all the albums on the page
   displayAlbums()


    // Attach an event listener to play, next ans previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent)/100
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",() => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to close button
    document.querySelector(".close").addEventListener("click",() => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
    })

    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e)
        currentSong.volume = parseInt(e.target.value)/100
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log(e.target)
        if(e.target.src.includes("images/volume.svg")){
            e.target.src = e.target.src.replace("images/volume.svg","images/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("images/mute.svg","images/volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}


main()