(function() {
    if (!sessionStorage.getItem('_grad_music_unlocked')) {
        window.location.href = 'index.html';
        return;
    }

    const songs = [
        { title: 'Seasons of love', artist: 'Alex, Allen, Austin, Benjamin, Eliot, Fiona, Hope, Hugh, Irene, Joy, Kevin, Nicole, Oliver', src: 'assets/Seasons of Love.wav' },
        { title: '克卜勒', artist: 'Nicole', src: 'assets/克卜勒.wav' },
        { title: 'Everything has changed', artist: 'Alex, Allen, Fiona', src: 'assets/example.m4a' },
        { title: 'City of stars', artist: 'Fiona, Nicole', src: 'assets/city of stars.wav' },
        { title: '我不配', artist: 'Fiona, Nicole', src: 'assets/我不配.wav' },
        { title: 'Satisfied', artist: 'Alex, Eliot, Fiona, Hope, Irene, Joy', src: 'assets/example.m4a' },
        { title: 'Without You Without Them', artist: 'Eliot, Oliver', src: 'assets/Without You Without Them.wav' }
    ];

    const bgLayer = document.getElementById('bgLayer');
    const BG_PHONE_URL = 'assets/backgroundphone.jpg';
    const BG_PC_URL = 'assets/backgroundpc.jpg';

    function updateBackground() {
        const ratio = window.innerWidth / window.innerHeight;
        bgLayer.style.backgroundImage = ratio >= 1 ? `url('${BG_PC_URL}')` : `url('${BG_PHONE_URL}')`;
        bgLayer.classList.toggle('phone', ratio < 1);
    }
    updateBackground();
    window.addEventListener('resize', updateBackground);
    window.addEventListener('orientationchange', () => setTimeout(updateBackground, 200));

    const songList = document.getElementById('songList');
    const previewInfo = document.getElementById('previewInfo');
    const previewTitle = document.getElementById('previewTitle');
    const previewArtist = document.getElementById('previewArtist');
    const placeholder = document.querySelector('.preview-placeholder');
    const playBtn = document.getElementById('playBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');

    let currentAudio = null;
    let currentSongIndex = -1;
    let isPlaying = false;

    function resetUI() {
        placeholder.style.display = 'block';
        previewInfo.style.display = 'none';
        playBtn.textContent = '▶ 播放';
        progressFill.style.width = '0%';
    }

    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.removeEventListener('timeupdate', onTimeUpdate);
            currentAudio.removeEventListener('loadedmetadata', onLoadedMeta);
            currentAudio.removeEventListener('ended', onEnded);
            currentAudio = null;
        }
        isPlaying = false;
    }

    function onTimeUpdate() {
        if (currentAudio && !isNaN(currentAudio.duration)) {
            const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressFill.style.width = percent + '%';
        }
    }

    function onLoadedMeta() {
        if (currentAudio && !isNaN(currentAudio.duration)) {
            const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressFill.style.width = percent + '%';
        }
    }

    function onEnded() {
        isPlaying = false;
        playBtn.textContent = '▶ 播放';
        progressFill.style.width = '0%';
    }

    function loadAndPlay(index) {
        stopCurrentAudio();
        const song = songs[index];
        currentAudio = new Audio(song.src);
        currentAudio.addEventListener('timeupdate', onTimeUpdate);
        currentAudio.addEventListener('loadedmetadata', onLoadedMeta);
        currentAudio.addEventListener('ended', onEnded);
        currentAudio.play().then(() => {
            isPlaying = true;
            playBtn.textContent = '⏸ 暂停';
        }).catch(err => {
            console.warn('播放失败:', err);
            isPlaying = false;
            playBtn.textContent = '▶ 播放';
        });
    }

    function togglePlay() {
        if (currentSongIndex === -1) return;
        if (!currentAudio) {
            loadAndPlay(currentSongIndex);
            return;
        }
        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
            playBtn.textContent = '▶ 播放';
        } else {
            currentAudio.play().then(() => {
                isPlaying = true;
                playBtn.textContent = '⏸ 暂停';
            }).catch(err => {
                console.warn('恢复播放失败:', err);
            });
        }
    }

    function selectSong(index) {
        const items = songList.querySelectorAll('.song-list-item');
        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');

        currentSongIndex = index;
        const song = songs[index];
        previewTitle.textContent = song.title;
        previewArtist.textContent = song.artist;
        placeholder.style.display = 'none';
        previewInfo.style.display = 'flex';

        if (currentAudio) {
            stopCurrentAudio();
            playBtn.textContent = '▶ 播放';
            progressFill.style.width = '0%';
        }
    }
    
    progressContainer.addEventListener('click', (e) => {
        if (!currentAudio || isNaN(currentAudio.duration)) return;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        currentAudio.currentTime = percent * currentAudio.duration;
        progressFill.style.width = (percent * 100) + '%';
    });

    function renderList() {
        songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'song-list-item';
            item.textContent = song.title;
            item.addEventListener('click', () => selectSong(index));
            songList.appendChild(item);
        });
    }

    playBtn.addEventListener('click', togglePlay);

    renderList();
    resetUI();
})();