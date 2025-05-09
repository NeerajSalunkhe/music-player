var mp3Links;
var songs = [];
var currentIndex = 0;
var currentAudio = null;

async function main(folder) {
    let a=await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    let responce=await a.text()
    const parser = new DOMParser();
    const doc = await parser.parseFromString(responce, 'text/html');
    mp3Links = Array.from(doc.querySelectorAll('a'))
    .filter(a => a.href.endsWith('.mp3'))
    .map(a => a.href);
    return mp3Links
    console.log(mp3Links);        
}   
// main("p1");
async function main2(folder){ 
    songs = await main(folder);
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML=''; 

    // Create list items for each song
    for (const song of songs) {
        const li = document.createElement('li');
        const songName = song.split('%')[0].split('/').pop().split('.')[0];

        li.innerHTML = `
            <img src="music.svg" class="invert" alt="">
            <div class="info">
                <div>${songName}</div>
                <div>${""}</div>
            </div>
            <div class="playnow">
                <div class="libplay"><img src="play2.svg" class="invert" alt=""></div>
            </div>
        `;

        songul.appendChild(li);
    }

    // Set up click handlers for the newly added songs
    setupSongClickHandlers();

    // Update play/pause icons based on currently playing song
    if (currentAudio) {
        const currentSongName = currentAudio.src.split('%')[0].split('/').pop().split('.')[0];
        document.querySelectorAll(".info > div:first-child").forEach(div => {
            if (div.innerText.trim() === currentSongName) {
                const li = div.closest("li");
                if (li) {
                    const playBtn = li.querySelector(".libplay");
                    if (playBtn) {
                        playBtn.innerHTML = currentAudio.paused ? 
                            '<img src="play2.svg" class="invert" alt="">' : 
                            '<img src="pause.svg" class="invert" alt="">';
                    }
                }
            }
        });
    }
}

function setupSongClickHandlers() {
    // Remove existing click handlers
    document.querySelectorAll(".libplay").forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll("li").forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

    // Add click handlers for play buttons
    document.querySelectorAll(".libplay").forEach(function(button){
        button.addEventListener("click", function(e){
            const parentLi = this.closest("li");
            const s_name = parentLi.querySelector(".info > div:first-child").innerText;
            
            // Find the correct song index
            const songIndex = songs.findIndex(song => {
                const songName = song.split('%')[0].split('/').pop().split('.')[0];
                return songName === s_name;
            });
            
            if (songIndex === -1) return;

            // If this song is already playing, toggle play/pause
            if (currentAudio && currentAudio.src.includes(s_name)) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    this.innerHTML = '<img src="pause.svg" class="invert" alt="">';
                    document.querySelector(".playbtn").innerHTML = '<img src="pause.svg" alt="Pause">';
                } else {
                    currentAudio.pause();
                    this.innerHTML = '<img src="play2.svg" class="invert" alt="">';
                    document.querySelector(".playbtn").innerHTML = '<img src="play2.svg" alt="Play">';
                }
            } else {
                // Play the new song
                playSongAt(songIndex);
            }
            e.stopPropagation();
        });
    });

    // Add click handlers for list items - only load song, don't play
    document.querySelectorAll("li").forEach(function(button){
        button.addEventListener("click", function(){
            const s_name = this.querySelector(".info > div:first-child").innerText;
            
            // Find the correct song index
            const songIndex = songs.findIndex(song => {
                const songName = song.split('%')[0].split('/').pop().split('.')[0];
                return songName === s_name;
            });
            
            if (songIndex === -1) return;

            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            currentIndex = songIndex;
            currentAudio = new Audio(songs[songIndex]);
            songinfo(currentAudio);
            document.querySelector(".playbtn").innerHTML = '<img src="play2.svg" alt="Play">';
            pp(currentAudio);
        });
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

var prv=0.5;
function vchange(prv){
    let bar=document.querySelector(".volumeseekbar");
    let p1=prv*100;
    document.querySelector(".volumecircle").style.left=p1+"%";
}
let bar=document.querySelector(".volumeseekbar");
vchange(prv);
bar.addEventListener("click",function(e){
    let target=e.currentTarget;
    let x=e.clientX-target.getBoundingClientRect().left;
    let wd=target.getBoundingClientRect().width;
    prv=x/wd;
    let pp=prv*100;
    vchange(prv);
})
let up = document.querySelector(".volumeup");
up.addEventListener("click", function () {
    prv=Math.min(prv+0.1,0.9);
    vchange(prv);
});
let down = document.querySelector(".volumedown");
down.addEventListener("click", function () {
    prv=Math.max(prv-0.1,0);
    vchange(prv);
});
function songinfo(currentAudio) {
    if (!currentAudio) return;
    if(prv!=-1){
        currentAudio.volume=prv;
        // console.log(prv);
    }
    if(currentAudio){     
        let up = document.querySelector(".volumeup");
        up.addEventListener("click", function () {
            currentAudio.volume = Math.min(currentAudio.volume + 0.1, 0.9);
            prv=currentAudio.volume;
            vchange(prv);
        });
        let down = document.querySelector(".volumedown");
        down.addEventListener("click", function () {
            currentAudio.volume = Math.max(currentAudio.volume - 0.1, 0);
            prv=currentAudio.volume;
            // console.log(prv);
            vchange(prv);
        });
    }
    
    // let bar=document.querySelector(".volumeseekbar");
    // bar.addEventListener("click",function(e){
    //     let target=e.currentTarget;
    //     let x=e.clientX-target.getBoundingClientRect().left;
    //     let wd=target.getBoundingClientRect().width;
    //     prv=x/wd;
    //     if(currentAudio) currentAudio.volume=prv;
    //     let pp=prv*100;
    //     document.querySelector(".volumecircle").style.left=pp+"%";
    // })


    let src = currentAudio.src;
    const songName = src.split('%')[0].split('/').pop().split('.')[0];

    const s_info = document.querySelector(".songinfo");
    s_info.innerHTML = `<img src="music.svg" class="invert" alt="">${songName}`;

    const time = document.querySelector(".songtime");
    time.innerHTML = `Loading...`;

    const circle = document.querySelector(".circle");
    const seekbar = document.querySelector("#seekbar"); // 🔧 Make sure your seekbar has this ID or change selector

    let isDragging = false;

    // First wait for metadata
    currentAudio.addEventListener('loadedmetadata', () => {
        const total = formatTime(currentAudio.duration);
        const current = formatTime(currentAudio.currentTime);
        time.innerHTML = `${current} / ${total}`;

        // Continuously update time and circle position
        currentAudio.addEventListener('timeupdate', () => {
            if (!isDragging) {
                const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
                circle.style.left = `${percent}%`;
                time.innerHTML = `${formatTime(currentAudio.currentTime)} / ${total}`;
            }
        });
    });
    document.querySelector(".seekbar").addEventListener("click", e => {
        let target=e.currentTarget;
        let x=e.clientX-target.getBoundingClientRect().left;
        let wd=target.getBoundingClientRect().width;
        let pp=x/wd*100;
        document.querySelector(".circle").style.left=pp+"%";
        let tot=currentAudio.duration;
        // console.log(tot);
        let cur=pp*tot/100;
        // console.log(cur);
        time.innerHTML = `${formatTime(cur)} / ${formatTime(tot)}`;
        currentAudio.currentTime=cur;
    });

}

async function pp(currentAudio) {
    if (!currentAudio) {
        return;
    }
    let src = currentAudio.src;
    const songName = src.split('%')[0].split('/').pop().split('.')[0];
    
    // Update all play buttons to show play icon first
    document.querySelectorAll(".libplay").forEach(playBtn => {
        playBtn.innerHTML = '<img src="play2.svg" class="invert" alt="">';
    });
    
    // Find and update the currently playing song's button
    const divs = document.querySelectorAll(".info > div:first-child");
    divs.forEach(div => {
        if (div.innerText.trim() === songName) {
            const li = div.closest("li");
            if (li) {
                const playBtn = li.querySelector(".libplay");
                if (playBtn) {
                    playBtn.innerHTML = currentAudio.paused ? 
                        '<img src="play2.svg" class="invert" alt="">' : 
                        '<img src="pause.svg" class="invert" alt="">';
                }
            }
        }
    });
}

// async function main3(folder){
    
// }
// var lefty=document.querySelector(".left").innerHTML;
const mediaqry1 = window.matchMedia('(max-width: 1100px)');
function handleMediaChange(e) {
    let nav = document.querySelector(".nav");
    let cards = document.querySelectorAll(".card");
    
    if (e.matches) {
        // Add transition class to cards
        cards.forEach(card => {
            card.style.transition = "all 0.3s ease-in-out";
        });
        nav.innerHTML = `<img src="hamburger.svg" class="burger" alt="">`;
    } else {
        nav.innerHTML = '';
    }
}

handleMediaChange(mediaqry1);
mediaqry1.addEventListener('change', handleMediaChange);

function main4(){
    let btn = document.querySelector(".nav");
    btn.addEventListener("click", function (e) {
        let menu = document.querySelector(".left");
        menu.style.left = "0px";
        menu.style.animation="sideright 0.3s";
    });
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("cross")) {
            let menu = document.querySelector(".left");
            menu.style.left = "-1000px";
            menu.style.animation="sideleft2 2s";
        }
    });

}
main4();
// var folder=null;
// main(folder);
var folder=null;
function main5(){
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async function() {
            const card = this.closest(".card"); 
            folder = card.dataset.folder; 
            await main2(folder);
        });
    });
}
async function albums(){
    let response = await fetch("http://127.0.0.1:3000/songs/");
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anch = div.getElementsByTagName("a");
    let folders=[]
    Array.from(anch).forEach(e => {
        if(e.href.includes("/songs")){
            folders.push(e.href.split('/')[4]);
        }
    });
    for(let i=0;i<folders.length;i++){
        let e=folders[i];
        let a = await fetch(`http://127.0.0.1:3000/songs/${e}/info.json`);
        let b=await a.json();
        let c=document.querySelector(".cardcontainer");
        c.innerHTML+=`
                    <div class="card" data-folder="${e}">
                        <div class="img1">
                            <img class="img" src="${b.image}" alt="">
                            <img class="play" src="play.svg" alt="">
                        </div>
                        <h4>${b.title}</h4>
                        <p>${b.description}</p>
                    </div>
        `;
    }
    document.querySelectorAll(".play").forEach(function(e){
        e.addEventListener("click", async function(e){
            e.stopPropagation();
            const card = this.closest(".card");
            const folder = card.dataset.folder;
            
            // Load songs list and play first song
            await main2(folder);
            
            // Get the first song and play it
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
            let responce = await a.text();
            const parser = new DOMParser();
            const doc = await parser.parseFromString(responce, 'text/html');
            let mp3Links = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.href.endsWith('.mp3'))
                .map(a => a.href);
            
            if (currentAudio){
                currentAudio.pause();
                currentAudio.currentTime=0;
            }
            pp(currentAudio);
            currentAudio = new Audio(mp3Links[0]);
            currentAudio.play();
            songinfo(currentAudio);
            document.querySelector(".playbtn").innerHTML = '<img src="pause.svg" alt="Pause">';
            pp(currentAudio);
        });
    });
    
    main5();
}
albums();
// main5();

var songs=[];
async function give() {
    if (folder) {
        songs=await main(folder);
    }
}
give();

// Remove duplicate event listeners and keep only the ones in setupSongClickHandlers
document.querySelector(".playbtn").addEventListener("click",function(){
    const playBtn = this;
    if(currentAudio.paused) {
        currentAudio.play();
        playBtn.innerHTML = '<img src="pause.svg" alt="Pause">';
    } else {
        currentAudio.pause();
        playBtn.innerHTML = '<img src="play2.svg" alt="Play">';
    }
    pp(currentAudio);
});

document.addEventListener('keydown', function (event) {
    if(!currentAudio) return;
    if (event.code === 'Space' && currentAudio) {
        event.preventDefault();
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
    }
    let playBtn=document.querySelector(".playbtn");
    if(currentAudio.paused) {
        playBtn.innerHTML = '<img src="play2.svg" alt="Pause">';
    } else {
        playBtn.innerHTML = '<img src="pause.svg" alt="Play">';
    }
    pp(currentAudio);
});

function playSongAt(index) {
    if (index >= 0 && index < songs.length) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentIndex = index;
        currentAudio = new Audio(songs[index]);
        currentAudio.play();
        songinfo(currentAudio);
        document.querySelector(".playbtn").innerHTML = '<img src="pause.svg" alt="Pause">';
        pp(currentAudio);
    }
}

document.querySelector(".nextbtn").addEventListener("click", function () {
    if (!currentAudio || !songs || songs.length === 0) return;
    playSongAt(currentIndex + 1);
});

document.querySelector(".prvbtn").addEventListener("click", function () {
    if (!currentAudio || !songs || songs.length === 0) return;
    playSongAt(currentIndex - 1);
});

// Remove any search-related event listeners
document.querySelector(".search").removeEventListener("click", null);
document.querySelector(".homi").removeEventListener("click", null);
document.removeEventListener("click", null);