import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './MusicCard.module.scss';
import { faPause, faPlay, faBackwardStep, faForwardStep, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgressBar from './ProgressBar';
import * as request from '~/utils/request';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const MusicCard = ({ songs, onSongChange, currentSongID }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.6);
    const audioRef = useRef(null);
    const navigate = useNavigate();

    // Đồng bộ bài hát với currentSongID
    useEffect(() => {
        if (songs.length === 0) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            setCurrentSong(null);
            setDuration(0);
            return;
        }

        const selectedSong = songs.find((song) => song.id === currentSongID) || songs[0];
        if (selectedSong && selectedSong.id !== currentSong?.id) {
            setCurrentSong(selectedSong);
            setIsPlaying(true);
            onSongChange(selectedSong);
        }
    }, [songs, currentSongID, currentSong?.id, onSongChange]);

    // Tải nguồn âm thanh khi currentSong thay đổi
    useEffect(() => {
        if (!currentSong || !audioRef.current) return;

        const audio = audioRef.current;
        audio.src = currentSong.audio_url;
        audio.load();

        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        audio.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [currentSong]);

    // Phát/tạm dừng âm thanh khi isPlaying thay đổi
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        const audio = audioRef.current;
        if (isPlaying) {
            audio
                .play()
                .then(() => console.log('Playing:', currentSong.title))
                .catch((e) => {
                    console.error('Play error:', e);
                    setIsPlaying(false);
                });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong]);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((e) => {
                        setIsPlaying(false);
                    });
            }
        }
    }, [isPlaying]);

    const playNext = useCallback(() => {
        if (!songs.length || !currentSong) return;

        const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % songs.length;
        const nextSong = songs[nextIndex];
        setCurrentSong(songs[nextIndex]);
        setIsPlaying(true);
        onSongChange(nextSong);
    }, [songs, currentSong, onSongChange]);

    const playPrev = useCallback(() => {
        if (!songs.length) return;
        const currentIndex = songs.findIndex((song) => song.id === currentSong?.id);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        const prevSong = songs[prevIndex];
        setCurrentSong(songs[prevIndex]);
        setIsPlaying(true);
        onSongChange(prevSong);
    }, [songs, currentSong, onSongChange]);

    const handleSeek = useCallback((e) => {
        const newTime = parseFloat(e.target.value);
        if (!audioRef.current) return;
        audioRef.current.currentTime = newTime;
    }, []);

    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        if (!audioRef.current) return;
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    }, []);

    const handleSongEnd = useCallback(async () => {
        if (currentSong) {
            try {
                await request.post(`/api/songs/${currentSong.id}/increase-play-count`);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        }
        playNext();
    }, [currentSong, playNext, navigate]);

    return (
        <div className={cx('music-player')}>
            <audio ref={audioRef} src={currentSong?.audio_url} onEnded={handleSongEnd} />

            <div className={cx('player-controls')}>
                <div className={cx('song-info-wr')}>
                    {currentSong ? (
                        <>
                            <img
                                className={cx('cover-image')}
                                src={currentSong.image || '/default-music-cover.png'}
                                alt={currentSong.title}
                                onError={(e) => {
                                    e.target.src = '/default-music-cover.png';
                                }}
                            />
                            <div className={cx('song-info')}>
                                <h3>{currentSong.title}</h3>
                                <p>{currentSong.artist_info?.name || 'Unknown Artist'}</p>
                            </div>
                        </>
                    ) : (
                        <p>Hãy chọn nội dung để nghe!</p>
                    )}
                </div>

                <div className={cx('progress-wrap')}>
                    <div className={cx('main-controls')}>
                        <div className={cx('control-btn')}>
                            <button onClick={playPrev} className={cx('faBackwardStep')}>
                                <FontAwesomeIcon size="2x" color="#ffffff" icon={faBackwardStep} />
                            </button>
                        </div>

                        <div className={cx('play-btn')} onClick={togglePlay}>
                            <button>
                                {isPlaying ? (
                                    <FontAwesomeIcon className={cx('faPause')} icon={faPause} />
                                ) : (
                                    <FontAwesomeIcon className={cx('faPlay')} icon={faPlay} />
                                )}
                            </button>
                        </div>

                        <div className={cx('control-btn')}>
                            <button onClick={playNext} className={cx('faForwardStep')}>
                                <FontAwesomeIcon size="2x" color="#ffffff" icon={faForwardStep} />
                            </button>
                        </div>
                    </div>

                    <ProgressBar duration={duration} onSeek={handleSeek} audioRef={audioRef} />
                </div>

                <div className={cx('volume-control')}>
                    <FontAwesomeIcon icon={faVolumeUp} color="#ffffff" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={cx('volume-slider')}
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicCard;
