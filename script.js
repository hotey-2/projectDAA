/* --- CDLL LOGIC --- */
class Node {
    constructor(data) {
        Object.assign(this, data);
        this.next = this.prev = null;
    }
}
class CircularList {
    constructor() { this.head = this.current = null; }
    add(data) {
        const n = new Node(data);
        if (!this.head) { this.head = n; n.next = n.prev = n; }
        else { const l = this.head.prev; l.next = n; n.prev = l; n.next = this.head; this.head.prev = n; }
    }
    goTo(idx) { let t = this.head; for (let i = 0; i < idx; i++) t = t.next; this.current = t; }
    indexOf(node) { let t = this.head, i = 0; while (t !== node) { t = t.next; i++; } return i; }
    toArray() {
        const arr = []; let t = this.head;
        if (!t) return arr;
        do { arr.push(t); t = t.next; } while (t !== this.head);
        return arr;
    }
}

// FIXED MAPPING: 3 -> Sandese, 4 -> Challa
const songsData = [
    { title: "Dhurandhar", artist: "MC Square", src: "1.jpeg", mp3: "1.mp3", duration: 215 },
    { title: "Arjan Vailly", artist: "Animal Movie", src: "2.jpeg", mp3: "2.mp3", duration: 182 },
    { title: "Sandese Aate Hai", artist: "Border 2", src: "3.jpeg", mp3: "3.mp3", duration: 622 },
    { title: "Challa", artist: "Uri Movie", src: "4.jpeg", mp3: "4.mp3", duration: 201 },
];

const db = new CircularList();
songsData.forEach(s => db.add(s));
db.current = db.head;

/* --- PLAYER ENGINE --- */
let isPlaying = false;
const audio = document.getElementById('main-audio');
let likedSongs = new Set();

function updateUI() {
    const s = db.current;
    const index = db.indexOf(s);
    document.getElementById('panel-art').src = s.src;
    document.getElementById('panel-title').textContent = s.title;
    document.getElementById('panel-artist').textContent = s.artist;
    document.getElementById('bar-art').src = s.src;
    document.getElementById('bar-title').textContent = s.title;
    document.getElementById('bar-artist').textContent = s.artist;
    
    if(audio.getAttribute('src') !== s.mp3) audio.src = s.mp3;

    document.querySelectorAll('.card').forEach((c, i) => c.classList.toggle('active-card', i === index));
    document.querySelectorAll('.list-item').forEach((li, i) => li.classList.toggle('playing', i === index));
}

function fmtTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

audio.ontimeupdate = () => {
    const p = audio.currentTime / audio.duration;
    const pct = (p * 100).toFixed(2) + '%';
    ['panel-fill', 'bar-fill'].forEach(id => document.getElementById(id).style.width = pct);
    ['panel-knob', 'bar-knob'].forEach(id => document.getElementById(id).style.left = pct);
    document.getElementById('cur-time').textContent = fmtTime(audio.currentTime);
    document.getElementById('bar-cur').textContent = fmtTime(audio.currentTime);
    document.getElementById('tot-time').textContent = fmtTime(audio.duration || 0);
    document.getElementById('bar-tot').textContent = fmtTime(audio.duration || 0);
};

function togglePlay() {
    if (isPlaying) { audio.pause(); setPlayState(false); }
    else { audio.play(); setPlayState(true); }
}

function setPlayState(playing) {
    isPlaying = playing;
    const icon = playing ? '⏸' : '▶';
    document.getElementById('panel-play').textContent = document.getElementById('bar-play').textContent = icon;
    const art = document.getElementById('panel-art');
    playing ? art.classList.add('spinning') : art.classList.remove('spinning');
}

document.querySelectorAll('#panel-next, #bar-next').forEach(el => el.onclick = () => { db.current = db.current.next; audio.src = db.current.mp3; updateUI(); if(isPlaying) audio.play(); });
document.querySelectorAll('#panel-prev, #bar-prev').forEach(el => el.onclick = () => { db.current = db.current.prev; audio.src = db.current.mp3; updateUI(); if(isPlaying) audio.play(); });
document.getElementById('panel-play').onclick = document.getElementById('bar-play').onclick = togglePlay;

/* --- SEEKER LOGIC --- */
const attachSeek = (id) => {
    const el = document.getElementById(id);
    el.onclick = (e) => {
        audio.currentTime = (e.offsetX / el.offsetWidth) * audio.duration;
        if (!isPlaying) togglePlay();
    };
};
attachSeek('panel-seeker');
attachSeek('bar-track');

/* --- INITIALIZE --- */
window.onload = () => {
    updateUI();
    const row = document.getElementById('card-row');
    const listView = document.getElementById('list-view');
    db.toArray().forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="card-thumb" style="background-image:url('${s.src}')"><div class="card-play-overlay">▶</div></div><h4>${s.title}</h4><p>${s.artist}</p>`;
        card.onclick = () => { db.goTo(i); audio.src = db.current.mp3; updateUI(); audio.play(); setPlayState(true); };
        row.appendChild(card);

        const li = document.createElement('div');
        li.className = 'list-item';
        li.innerHTML = `<img src="${s.src}"><div class="li-text"><div class="li-title">${s.title}</div><div class="li-artist">${s.artist}</div></div><div class="li-dur">${fmtTime(s.duration)}</div>`;
        li.onclick = card.onclick;
        listView.appendChild(li);
    });

    const h = new Date().getHours();
    document.getElementById('greeting').textContent = h < 12 ? 'Good Morning ☀️' : h < 17 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';

    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'flex';
        setTimeout(() => document.getElementById('app').classList.add('visible'), 50);
    }, 3200);
};