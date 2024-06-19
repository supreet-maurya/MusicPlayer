
let songs;
let currentFolder;
async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    if (!a.ok) {
        throw new Error(`HTTP error! status: ${a.status}`);
    }
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let artist_name = (`${folder}`).split("/")[1].replaceAll("%20" , " ");
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songNAME = song.replaceAll("%20", " ");
        songUL.innerHTML += `<li>
                            <img class = "invert" src = "img/music.svg" alt="">
                            <div class="info">
                                <div>
                                    ${songNAME.split(".mp3")[0]}
                                </div>
                                <div>
                                ${artist_name}
                                </div>
                            </div>
                            <div class = "playnow">
                                <span>Play Now</span>
                                <img src = "img/play_song.svg" class = "invert" alt = "">
                            </div>
                        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3");
        })
    })

    return songs;
}



let currentSong = new Audio();
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").split(".mp3")[0];
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.ceil(seconds % 60);
    return `${(minutes < 10 ? '0' : '')}${minutes}:${(remainingSeconds < 10 ? '0' : '')}${remainingSeconds}`;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.getElementsByClassName("cardContainer")[0];

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.split("/").slice(-2)[0] == "songs") {
            let folder = e.href.split("/").slice(-2)[1];

            let dynamic_a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await dynamic_a.json();
            cardContainer.innerHTML += `<div data-folder = "${folder}" class="card rounded">
                        <div class="play toggle">
                            <img src="img/play.svg" alt="" srcset="">
                        </div>
                        <img src= "/songs/${folder}/cover.jpg" alt="" srcset="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    }

    //loading library on clicking card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })


}



async function main() {
    await getSongs("songs/Juss");

    playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play_song.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    document.querySelector(".seekbar").addEventListener("click", e => {
        let ppr = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = ppr + "%";
        currentSong.currentTime = ((currentSong.duration) * ppr) / 100;
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //adding event to volume
    document.querySelector(".volume_range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    

    document.querySelector(".volume_range>img").addEventListener("click" , e=>{
        if( e.target.src.includes("img/volume.svg") ) {
            e.target.src = e.target.src.replace("img/volume.svg" , "img/mute.svg");
            currentSong.volume = 0;

            document.querySelector(".volume_range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg" , "img/volume.svg");
            currentSong.volume = 0.15;
            document.querySelector(".volume_range").getElementsByTagName("input")[0].value = 15;
        }
    })


}

main();