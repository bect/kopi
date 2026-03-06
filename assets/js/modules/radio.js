export async function initRadio(configPath) {
    const radioWidget = document.getElementById('radioWidget');
    if (!radioWidget || radioWidget.dataset.initialized) return;

    let stations = [];
    try {
        const response = await fetch(configPath);
        if (!response.ok) throw new Error('Radio config missing');
        stations = await response.json();
    } catch (error) {
        console.error("Failed to load radio stations:", error);
        return;
    }

    if (!stations || stations.length === 0) {
        console.warn("No radio stations found.");
        return;
    }

    radioWidget.dataset.initialized = "true";
    const playBtn = document.getElementById('radioPlayBtn');
    const audio = document.getElementById('radioAudio');
    const iconPlay = playBtn ? playBtn.querySelector('.icon-play') : null;
    const iconPause = playBtn ? playBtn.querySelector('.icon-pause') : null;

    const btnCycle = document.getElementById('btnCycleStation');
    const volumeSlider = document.getElementById('volumeSlider');
    const btnVolume = document.getElementById('btnVolume');
    const currentStationName = document.querySelector('.radio-station-title');
    const currentTrackTitle = document.querySelector('.radio-station-desc');
    const statusDisplay = document.getElementById('radioStatusDisplay');
    const liveDot = radioWidget.querySelector('.live-dot');
    
    // Background Visualizer Setup
    let canvas = document.getElementById('radioCanvas');
    let audioContext, analyser, animationId;
    let bars = [];

    // Initialize canvas to match widget dimensions
    function initCanvas() {
        if (!canvas) return;

        const rect = radioWidget.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initAudioContext() {
        if (!audioContext && audio) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.smoothingTimeConstant = 0.4;
            analyser.fftSize = 64; // Low resolution for retro bar look
            
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function drawVisualizer() {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        let bufferLength = 64; // Default for simulation
        let dataArray = null;

        if (analyser) {
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
        }

        // Calculate average audio level for gradient intensity
        let avgAudioLevel = 0;
        if (dataArray) {
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            avgAudioLevel = sum / dataArray.length / 255; // Normalize to 0-1
        }

        const time = Date.now() * 0.001; // Convert to seconds for smooth animation
        const audioIntensity = Math.max(avgAudioLevel, 0.1); // Minimum intensity for subtle movement

        // Audio-reactive gradient movement
        const gradientBg = ctx.createLinearGradient(
            Math.sin(time * 0.5 * audioIntensity) * canvas.width * (0.3 * audioIntensity),
            Math.cos(time * 0.3 * audioIntensity) * canvas.height * (0.3 * audioIntensity),
            canvas.width + Math.sin(time * 0.7 * audioIntensity) * canvas.width * (0.3 * audioIntensity),
            canvas.height + Math.cos(time * 0.4 * audioIntensity) * canvas.height * (0.3 * audioIntensity)
        );

        // Light-mode friendly gradient colors - brighter and more vibrant
        const colorIntensity = 60 + (avgAudioLevel * 40); // 60-100% saturation for vibrancy
        const lightnessBase = 70 + (avgAudioLevel * 20); // 70-90% lightness for brightness
        const opacityBase = 0.06 + (avgAudioLevel * 0.08); // 0.06-0.14 opacity range

        gradientBg.addColorStop(0, `hsla(${(time * 30 * audioIntensity) % 360}, ${colorIntensity}%, ${lightnessBase}%, ${opacityBase * 1.2})`);
        gradientBg.addColorStop(0.3, `hsla(${(time * 25 * audioIntensity + 120) % 360}, ${colorIntensity * 0.9}%, ${lightnessBase * 0.95}%, ${opacityBase})`);
        gradientBg.addColorStop(0.6, `hsla(${(time * 20 * audioIntensity + 240) % 360}, ${colorIntensity * 0.8}%, ${lightnessBase * 0.9}%, ${opacityBase * 0.8})`);
        gradientBg.addColorStop(1, `hsla(${(time * 35 * audioIntensity + 60) % 360}, ${colorIntensity * 0.7}%, ${lightnessBase * 0.85}%, ${opacityBase * 1.1})`);

        ctx.fillStyle = gradientBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Light-mode friendly radial gradient overlay
        const radialGradient = ctx.createRadialGradient(
            canvas.width / 2 + Math.sin(time * 0.8 * audioIntensity) * canvas.width * (0.2 * audioIntensity),
            canvas.height / 2 + Math.cos(time * 0.6 * audioIntensity) * canvas.height * (0.2 * audioIntensity),
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height) * 0.8
        );
        const radialOpacity = 0.02 + (avgAudioLevel * 0.05); // 0.02-0.07 opacity range for light mode
        radialGradient.addColorStop(0, `hsla(${(time * 40 * audioIntensity) % 360}, 40%, 75%, ${radialOpacity})`);
        radialGradient.addColorStop(1, 'hsla(0, 100%, 100%, 0)');

        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Retro 3-color palette for classic audio visualizer feel
        const colorPalette = [
            '#00ff00', // Classic bright green
            '#ffb000', // Warm amber/orange
            '#0080ff'  // Electric blue
        ];

        // Create gradient for smoother visual effect
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)'); // Very transparent at bottom
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)'); // Medium transparency in middle
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)'); // More opaque at top

        const particleCount = 12; // Fewer, larger particles for background effect

        if (bars.length !== particleCount) {
            bars = new Array(particleCount).fill(0);
        }

        for (let i = 0; i < particleCount; i++) {
            let target;
            if (dataArray) {
                // Map different frequency ranges to different particles for better visualization
                const freqRange = Math.floor(i / 3); // Group particles by frequency ranges
                let startFreq = 0;
                let endFreq = bufferLength;

                // Map particle groups to different frequency ranges
                if (freqRange === 0) { // Low frequencies (bass)
                    startFreq = 0;
                    endFreq = Math.floor(bufferLength * 0.2);
                } else if (freqRange === 1) { // Mid frequencies
                    startFreq = Math.floor(bufferLength * 0.2);
                    endFreq = Math.floor(bufferLength * 0.6);
                } else { // High frequencies (treble)
                    startFreq = Math.floor(bufferLength * 0.6);
                    endFreq = bufferLength;
                }

                // Average the frequency data in this range
                let sum = 0;
                let count = 0;
                for (let j = startFreq; j < endFreq; j++) {
                    sum += dataArray[j] || 0;
                    count++;
                }
                const avgData = count > 0 ? sum / count : 0;

                // Amplify the average for clear up/down movement
                target = avgData * 2.5; // Strong amplification for visible movement
                target = Math.min(Math.max(target, 15), 255); // Keep in reasonable range
            } else {
                // Simulation: Smooth random movement
                target = Math.random() * 180 + 30;
            }

            // Fast smoothing for responsive up/down movement
            bars[i] += (target - bars[i]) * 0.25;
            const value = bars[i];

            // Create square bouncy particles synced with audio data
            const squareSize = 12; // Square dimensions
            const spacing = canvas.width / particleCount;
            const centerX = (i * spacing) + (spacing / 2);
            const baseY = canvas.height * 0.5; // Center base position

            // Make bounce the primary audio response
            const audioLevel = (value / 255); // 0-1 range from audio data
            const bounceRange = canvas.height * 0.4; // How far they can bounce
            const y = baseY - (audioLevel * bounceRange); // Direct audio-driven bounce

            // Minimal horizontal movement for stability
            const subtleDrift = Math.sin(Date.now() * 0.002 + i) * 3; // Gentle, consistent drift
            const x = centerX + subtleDrift - (squareSize / 2);

            // No rotation - keep it clean and focused on bounce
            ctx.save();
            ctx.translate(x + squareSize/2, y + squareSize/2);

            const particleColor = colorPalette[i % colorPalette.length];
            ctx.fillStyle = particleColor + '90'; // More visible

            // Draw the square
            ctx.fillRect(-squareSize/2, -squareSize/2, squareSize, squareSize);

            // Add audio-reactive glow
            ctx.shadowColor = particleColor;
            ctx.shadowBlur = audioLevel * 12 + 4; // Audio-reactive glow
            ctx.fillRect(-squareSize/2, -squareSize/2, squareSize, squareSize);
            ctx.restore();
            ctx.shadowBlur = 0; // Reset shadow
        }

        // Always run animation to show visualizer presence
        animationId = requestAnimationFrame(drawVisualizer);
    }

    function updateStatus(status, type = 'normal') {
        if (statusDisplay) {
            const statusText = statusDisplay.querySelector('span:last-child');
            if (statusText) statusText.textContent = status;
        }
        if (liveDot) {
            if (type === 'error') {
                liveDot.style.backgroundColor = '#ef4444';
                liveDot.style.animation = 'none';
                liveDot.style.opacity = '0.5';
            } else if (type === 'loading') {
                liveDot.style.backgroundColor = '#eab308';
                liveDot.style.animation = 'pulse 0.5s infinite';
                liveDot.style.opacity = '1';
            } else {
                liveDot.style.backgroundColor = '#ef4444';
                liveDot.style.animation = 'pulse 1.5s infinite';
                liveDot.style.opacity = '1';
            }
        }
    }

    function updateVolumeIcon() {
        if (!btnVolume || !audio) return;
        const vol = audio.muted ? 0 : audio.volume;
        const speaker = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>';
        let iconPath = '';
        
        if (vol === 0) {
            iconPath = '<line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
        } else if (vol < 0.5) {
            iconPath = '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
        } else {
            iconPath = '<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
        }
        btnVolume.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${speaker}${iconPath}</svg>`;
    }

    const savedState = JSON.parse(localStorage.getItem('kopi_radio_state') || '{}');
    let currentIdx = Math.floor(Math.random() * stations.length);
    if (savedState.stationIndex !== undefined && savedState.stationIndex >= 0 && savedState.stationIndex < stations.length) {
        currentIdx = savedState.stationIndex;
    }

    function saveRadioState() {
        if (!audio) return;
        localStorage.setItem('kopi_radio_state', JSON.stringify({
            stationIndex: currentIdx,
            volume: audio.volume
        }));
    }

    let errorCount = 0;
    let autoSwitchTimer;

    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;
        
        const station = stations[currentIdx];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.description || station.title,
            artist: station.title,
            album: 'Kopi Radio',
            artwork: [
                { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => { if (audio.paused && playBtn) playBtn.click(); });
        navigator.mediaSession.setActionHandler('pause', () => { if (!audio.paused && playBtn) playBtn.click(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { if (btnCycle) btnCycle.click(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            initAudioContext();
            errorCount = 0;
            if (autoSwitchTimer) clearTimeout(autoSwitchTimer);
            currentIdx = (currentIdx - 1 + stations.length) % stations.length;
            loadStation(currentIdx, true);
        });
    }

    function handleAutoSwitch() {
        if (autoSwitchTimer) clearTimeout(autoSwitchTimer);

        if (errorCount < stations.length) {
            errorCount++;
            console.log(`Station error. Switching to next station... (${errorCount}/${stations.length})`);
            autoSwitchTimer = setTimeout(() => {
                currentIdx = (currentIdx + 1) % stations.length;
                loadStation(currentIdx, true);
                autoSwitchTimer = null;
            }, 1000);
        } else {
            console.warn("All stations failed.");
            radioWidget.classList.remove('playing');
            if(iconPlay) iconPlay.style.display = 'block';
            if(iconPause) iconPause.style.display = 'none';
            updateStatus('OFFL', 'error');
            // Keep animation running even on failure
        }
    }

    if(audio) {
        audio.crossOrigin = "anonymous";
        if (savedState.volume !== undefined) {
            audio.volume = savedState.volume;
        }
        audio.src = stations[currentIdx].stream_url;
        if(currentStationName) currentStationName.textContent = stations[currentIdx].title;
        if(currentTrackTitle) currentTrackTitle.textContent = stations[currentIdx].description;
        updateMediaSession();

        audio.addEventListener('waiting', () => updateStatus('BUFF', 'loading'));
        audio.addEventListener('playing', () => { updateStatus('LIVE', 'normal'); errorCount = 0; saveRadioState(); });
        audio.addEventListener('pause', () => updateStatus('PAUS', 'normal'));
        audio.addEventListener('error', () => { updateStatus('FAIL', 'error'); if (radioWidget.classList.contains('playing')) handleAutoSwitch(); });
        audio.addEventListener('loadstart', () => updateStatus('LOAD', 'loading'));
        audio.addEventListener('volumechange', () => { updateVolumeIcon(); saveRadioState(); });
        if (volumeSlider) {
            volumeSlider.value = audio.volume;
        }
        updateVolumeIcon();
    }

    function loadStation(index, autoPlay = false) {
        const station = stations[index];
        if(currentStationName) currentStationName.textContent = station.title;
        if(currentTrackTitle) currentTrackTitle.textContent = station.description;
        updateMediaSession();
        
        const wasPlaying = autoPlay || !audio.paused || radioWidget.classList.contains('playing');
        audio.pause();
        updateStatus('LOAD', 'loading');
        audio.src = station.stream_url;
        audio.load();
        
        if(wasPlaying) {
             const playPromise = audio.play();
             if (playPromise !== undefined) {
                 playPromise.then(() => {
                    radioWidget.classList.add('playing');
                    if(iconPlay) iconPlay.style.display = 'none';
                    if(iconPause) iconPause.style.display = 'block';
                    // Animation already running continuously
                 }).catch(error => {
                     console.error("Station switch error:", error);
                     radioWidget.classList.remove('playing');
                     updateStatus('ERRO', 'error');
                     if(iconPlay) iconPlay.style.display = 'block';
                     if(iconPause) iconPause.style.display = 'none';
                     handleAutoSwitch();
                 });
             }
        }
    }

    // Both play button and status display are always visible
    function showPlayButton() {
        if (playBtn) playBtn.style.display = 'flex';
        if (statusDisplay) statusDisplay.style.display = 'flex';
    }

    function showStatusDisplay() {
        // Both are always visible, no hiding needed
        if (playBtn) playBtn.style.display = 'flex';
        if (statusDisplay) statusDisplay.style.display = 'flex';
    }

    // Initialize with both visible
    showPlayButton();

    if (playBtn && audio && radioWidget) {
                playBtn.addEventListener('click', () => {
            errorCount = 0;
            if (autoSwitchTimer) clearTimeout(autoSwitchTimer);
            if (audio.paused) {
                initAudioContext(); // Initialize on user interaction
                updateStatus('CONN', 'loading');
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        radioWidget.classList.add('playing');
                        showStatusDisplay(); // Show status display when playing
                        // Show pause icon when playing
                        if(iconPlay) iconPlay.style.display = 'none';
                        if(iconPause) iconPause.style.display = 'block';
                        // Animation already running continuously
                    }).catch(error => {
                        console.error("Playback error:", error);
                        showPlayButton(); // Show play button on error
                        // Show play icon when not playing
                        if(iconPlay) iconPlay.style.display = 'block';
                        if(iconPause) iconPause.style.display = 'none';
                        if (error.name !== 'AbortError') {
                            updateStatus('ABER', 'error'); handleAutoSwitch();
                        }
                    });
                }
            } else {
                audio.pause();
                radioWidget.classList.remove('playing');
                showPlayButton(); // Show play button when paused
                // Show play icon when paused
                if(iconPlay) iconPlay.style.display = 'block';
                if(iconPause) iconPause.style.display = 'none';
                // Keep animation running even when paused
            }
        });
    }

    // Status display is now just for display - no click action

    if(btnCycle) btnCycle.addEventListener('click', () => { 
        initAudioContext();
        errorCount = 0;
        if (autoSwitchTimer) clearTimeout(autoSwitchTimer);
        currentIdx = (currentIdx + 1) % stations.length; loadStation(currentIdx, true); 
    });
    
    if(volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
    }
    
    if(btnVolume) {
        btnVolume.addEventListener('click', () => {
            audio.muted = !audio.muted;
        });
    }

    // Initialize canvas and start animation immediately
    initCanvas();
    drawVisualizer(); // Start the animation loop right away
    window.addEventListener('resize', () => {
        initCanvas();
    });
}
