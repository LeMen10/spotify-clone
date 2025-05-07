import React, { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './MusicCard.module.scss';

const cx = classNames.bind(styles);

const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const ProgressBar = React.memo(({ duration, onSeek, audioRef }) => {
    const progressRef = useRef();
    const timeRef = useRef();
    const currentTimeRef = useRef(0);
    const animationFrameRef = useRef();

    useEffect(() => {
        const updateProgress = () => {
            if (!audioRef.current) return;
            const currentTime = audioRef.current.currentTime;
            currentTimeRef.current = currentTime;

            if (progressRef.current) {
                progressRef.current.value = currentTime;
            }
            if (timeRef.current) {
                timeRef.current.textContent = formatTime(currentTime);
            }
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        };

        animationFrameRef.current = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [audioRef]);

    return (
        <div className={cx('progress-container')}>
            <span ref={timeRef}>{formatTime(currentTimeRef.current)}</span>
            <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 100}
                defaultValue={currentTimeRef.current}
                onChange={onSeek}
                className={cx('progress-bar')}
            />
            <span>{formatTime(duration)}</span>
        </div>
    );
});

export default ProgressBar;
