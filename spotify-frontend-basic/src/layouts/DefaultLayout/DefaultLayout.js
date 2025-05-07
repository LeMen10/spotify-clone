import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import className from 'classnames/bind';
import styles from './DefaultLayout.module.scss';
import Header from '~/components/Header/Header';
import Sidebar from '~/components/Sidebar/Sidebar';
import MusicCard from '~/components/MusicCard/MusicCard';
import Message from '~/components/Message/Message';
import GeminiChat from '~/components/GeminiChat/GeminiChat';
import Welcome from '~/components/Welcome/Welcome';
import Cookies from 'js-cookie';
import * as request from '~/utils/request';

const cx = className.bind(styles);
const DefaultLayout = ({ children }) => {
    const [checkOnClickChat, setCheckOnClickChat] = useState(false);
    const [checkOnClickChatGemini, setCheckOnClickChatGemini] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSongID, setCurrentSongID] = useState(null);
    const token = Cookies.get('token');
    const [isRegisterPremium, setIsRegisterPremium] = useState(false);

    const fetchPlaylists = async () => {
        try {
            const res = await request.get('/api/playlists/get-playlist-by-limit');
            setPlaylists(res.data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            if (token) fetchPlaylists();
        }, 1000);

        return () => clearTimeout(timer);
    }, [token]);

    const handlePlaylistAction = (action) => {
        fetchPlaylists();
        if (action.type === 'PLAY_SONGS') {
            setSongs(action.data);
            // Nếu có chỉ định bài hát cụ thể thì phát bài đó
            if (action.currentSongID) setCurrentSongID(action.currentSongID);
            else {
                // Không thì phát bài đầu tiên
                setCurrentSongID(action.data[0]?.id || null);
            }
        } else if (action.type === 'PLAY_SINGLE_SONG') {
            // Đặc biệt xử lý khi chọn phát 1 bài cụ thể
            setSongs(action.data);
            setCurrentSongID(action.currentSongID); // Luôn cập nhật ID bài được chọn
        } else if (action.type === 'UPDATE_SONG_LIST') {
            // Khi thêm/xóa bài (không đổi bài đang phát)
            const currentExists = action.data.some((song) => song.id === currentSongID);
            setSongs(action.data);

            // Chỉ reset nếu bài hiện tại bị xóa
            if (!currentExists) {
                setCurrentSongID(action.data[0]?.id || null);
            }
        }
    };

    const handleSongChange = (song) => {
        setCurrentSongID(song.id);
    };

    const handlePremiumStatusChange = (isActive) => {
        setIsRegisterPremium(isActive);
    };

    return (
        <div>
            {isLoading ? (
                <div className={cx('spinner-wr')}>
                    <div className={cx('spinner')}></div>
                </div>
            ) : (
                isLoading === false && (
                    <div className={cx('wrapper')}>
                        {!token && <Welcome />}
                        <div>
                            <Header
                                setCheckOnClickChat={setCheckOnClickChat}
                                setCheckOnClickChatGemini={setCheckOnClickChatGemini}
                                onPremiumStatusChange={handlePremiumStatusChange}
                            />
                        </div>
                        <div className={cx('container')}>
                            <Sidebar onPlaylistAction={handlePlaylistAction} playlists={playlists} />
                            <div className={cx('content')}>
                                {React.cloneElement(children, {
                                    onPlaylistAction: handlePlaylistAction,
                                    currentSongID,
                                    isRegisterPremium,
                                })}
                            </div>
                            {checkOnClickChat && <Message setCheckOnClickChat={setCheckOnClickChat} />}
                            {checkOnClickChatGemini && (
                                <GeminiChat setCheckOnClickChatGemini={setCheckOnClickChatGemini} />
                            )}
                            {/* <Message setCheckOnClickChat={setCheckOnClickChat}/> */}
                            {/* <WaitingList/> */}
                        </div>
                        <div>
                            <MusicCard songs={songs} currentSongID={currentSongID} onSongChange={handleSongChange} />
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DefaultLayout;
