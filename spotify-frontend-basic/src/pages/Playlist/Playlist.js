import React from 'react';
import classNames from 'classnames/bind';
import styles from './Playlist.module.scss';
import { EllipsisVerticalIcon, MusicIcon, TrashIcon, UpdateIcon, ShareIcon } from '~/components/Icons';
import { useState, useEffect, useRef } from 'react';
import * as request from '~/utils/request';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Footer from '~/components/Footer/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';

const cx = classNames.bind(styles);

const Playlist = ({ onPlaylistAction, currentSongID, isRegisterPremium }) => {
    const navigate = useNavigate();
    const [songQuery, setSongQuery] = useState();
    const [playlistDetail, setPlaylistDetail] = useState({});
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [stateMenu, setStateMenu] = useState(false);
    const menuRef = useRef(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [playlistData, setPlaylistData] = useState({
        name: '',
        description: '',
    });

    const [songOfPlaylist, setSongOfPlaylist] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/playlists/get-playlist/${id}`);
                setPlaylistDetail(res);
            } catch (error) {
                if (error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            }
        })();
    }, [navigate, id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setStateMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEditClick = () => {
        if (playlistDetail) {
            setPlaylistData({
                name: playlistDetail.name || '',
                description: playlistDetail.description || '',
            });
        }
        setOpenModal(true);
        setStateMenu(false);
    };

    const handleSavePlaylist = async () => {
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('name', playlistData.name);
            formData.append('description', playlistData.description);
            if (selectedImage) formData.append('image', selectedImage);

            try {
                await axios.put(`${process.env.REACT_APP_BASE_URL}api/playlists/update-playlist/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setOpenModal(false);
                const updatedRes = await request.get(`/api/playlists/get-playlist/${id}`);
                setPlaylistDetail(updatedRes);
                onPlaylistAction('Update');
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPlaylistData((prev) => ({
                ...prev,
                image: file,
            }));
        }
    };

    const handleDeleteClick = async () => {
        try {
            await request.delete_method(`/api/playlists/delete-playlist/${id}`);
            onPlaylistAction('Delete');
            navigate('/');
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    // search
    useEffect(() => {
        if (!debouncedSearch) return;
        (async () => {
            try {
                const res = await request.get(`/api/songs/search?query=${encodeURIComponent(debouncedSearch)}`);
                setSongQuery(res);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        })();
    }, [debouncedSearch, navigate]);

    // update debouncedSearch sau (500ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        // Cleanup timeout khi searchTerm update || component unmount
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSongQuery([]);
    };

    const addSongToPlaylist = async (songId, isPremium) => {
        if (!isRegisterPremium && isPremium)
            return toast.warning('Đăng ký Premium để có thể thêm vào Playlist của bạn !!!');
        const data = {
            playlist_id: id,
            song_id: songId,
        };
        try {
            await request.post(`/api/playlist/add-song/`, data);
            const updatedSongs = await request.get(`/api/playlist/get-songs/${id}`);
            setSongOfPlaylist(updatedSongs);
            onPlaylistAction({ type: 'UPDATE_SONG_LIST', data: updatedSongs });
        } catch (error) {
            console.error('Error fetching songs:', error);
            if (error.response.status === 401) navigate('/login');
            if (error.response.status === 400) toast.warning('Bài hát đã có trong danh sách.');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/playlist/get-songs/${id}`);
                setSongOfPlaylist(res);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [id, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    };

    // play all songs in playlist
    const handlePlayClick = async () => {
        try {
            const res = await request.get(`/api/playlist/get-songs/${id}`);
            onPlaylistAction({ type: 'PLAY_SONGS', data: res });
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    // play single song and move song active to first position
    const handlePlaySingleSong = (song) => {
        const reorderedSongs = [song, ...songOfPlaylist.filter((s) => s.id !== song.id)];
        onPlaylistAction({ type: 'PLAY_SONGS', data: reorderedSongs, currentSongID: song.id });
    };

    // delete song from playlist
    const handleDeleteSong = async (songId) => {
        try {
            await request.delete_method(`/api/playlist/remove-song/`, {
                data: { playlist_id: id, song_id: songId },
            });
            const res = await request.get(`/api/playlist/get-songs/${id}`);
            setSongOfPlaylist(res);
            onPlaylistAction({ type: 'UPDATE_SONG_LIST', data: res });
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    return (
        <>
            {isLoading ? (
                <div className={cx('spinner-wr')}>
                    <div className={cx('spinner')}></div>
                </div>
            ) : (
                <>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <div className={cx('container')} aria-label="Playlist Danh sách phát của tôi #1" role="main">
                        <header className={cx('header')}>
                            {playlistDetail && (
                                <>
                                    <div
                                        className={cx('cover')}
                                        aria-label="Playlist cover image placeholder with music note icon"
                                    >
                                        {playlistDetail?.image ? (
                                            <img
                                                alt="Gray music note icon on dark square background"
                                                height="64"
                                                src={playlistDetail?.image}
                                                width="64"
                                            />
                                        ) : (
                                            <span className={cx('music-icon')}>
                                                <MusicIcon />
                                            </span>
                                        )}
                                    </div>
                                    <div className={cx('header-text')}>
                                        <div className={cx('subtitle')}>Danh sách phát</div>
                                        <h1>{playlistDetail?.name}</h1>
                                        <strong className={cx('description')}>{playlistDetail?.description}</strong>
                                        <div className={cx('author')}>
                                            <strong>{playlistDetail?.fullname}</strong>
                                            <span className={cx('dot')}>·</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </header>

                        <section className={cx('search-section')} aria-label="Search content for playlist">
                            <div className={cx('actions-bar')}>
                                {songOfPlaylist.length > 0 && (
                                    <div className={cx('pause-music-icon')}>
                                        <div className={cx('play-music-btn')} onClick={() => handlePlayClick()}>
                                            Phát tất cả
                                        </div>
                                    </div>
                                )}
                                <div className={cx('ellipsis-vertical-icon')} onClick={() => setStateMenu(true)}>
                                    <EllipsisVerticalIcon />
                                </div>
                                {stateMenu && (
                                    <nav className={cx('menu')} role="menu" aria-label="Context menu" ref={menuRef}>
                                        <div className={cx('menu-item')} role="menuitem" onClick={handleEditClick}>
                                            <UpdateIcon fill="#aeaeae" width="16" height="16" />
                                            Sửa thông tin chi tiết
                                        </div>
                                        <div className={cx('menu-item')} role="menuitem" onClick={handleDeleteClick}>
                                            <TrashIcon fill="#aeaeae" width="16" height="16" />
                                            Xoá
                                        </div>
                                        <div
                                            className={cx('menu-item')}
                                            role="menuitem"
                                            onClick={() => setStateMenu(false)}
                                        >
                                            <ShareIcon fill="#aeaeae" width="16" height="16" />
                                            Chia sẻ
                                        </div>
                                    </nav>
                                )}
                            </div>
                            {songOfPlaylist.length > 0 && (
                                <div aria-label="Music list" className={cx('table-music')} role="table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Tiêu đề</th>
                                                <th aria-label="Duration" scope="col">
                                                    Thời lượng
                                                </th>
                                                <th scope="col">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {songOfPlaylist.map((song, index) => (
                                                <tr key={song.id}>
                                                    <td
                                                        className={cx('song-title', {
                                                            active: currentSongID === song.id,
                                                        })}
                                                        onClick={() => handlePlaySingleSong(song)}
                                                    >
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div className={cx('song-info')}>
                                                            <img
                                                                alt="Album cover showing sunset over mountains with orange sky"
                                                                height="40"
                                                                src={song.image}
                                                                width="40"
                                                                onClick={() =>
                                                                    handlePlaySingleSong(song, song.is_premium)
                                                                }
                                                            />
                                                            <div className={cx('song-text')}>
                                                                <span
                                                                    className={cx('song-title', {
                                                                        active: currentSongID === song.id,
                                                                    })}
                                                                    onClick={() =>
                                                                        handlePlaySingleSong(song, song.is_premium)
                                                                    }
                                                                >
                                                                    {song.title}
                                                                </span>
                                                                <span
                                                                    className={cx('song-artist')}
                                                                    onClick={() =>
                                                                        handlePlaySingleSong(song, song.is_premium)
                                                                    }
                                                                >
                                                                    {song.artist_info.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{formatTime(song.duration)}</td>
                                                    <td>
                                                        <div
                                                            className={cx('song-delete-btn')}
                                                            onClick={() => handleDeleteSong(song.id)}
                                                        >
                                                            <TrashIcon fill="#aeaeae" width="16" height="16" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <h2>Hãy cùng tìm nội dung cho danh sách phát của bạn</h2>

                            <div className={cx('search-input-wrapper')}>
                                <svg
                                    aria-hidden="true"
                                    className={cx('search-icon')}
                                    focusable="false"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 
                            0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 
                            4.23-1.57l.27.28v.79l5 4.99L20.49 
                            19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"
                                    />
                                </svg>
                                <input
                                    aria-label="Search songs and podcasts"
                                    placeholder="Tìm bài hát và tập podcast"
                                    type="input"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <button
                                    type="reset"
                                    aria-label="Clear search input"
                                    className={cx('clear-btn')}
                                    onClick={handleClearSearch}
                                >
                                    ×
                                </button>
                            </div>

                            {songQuery && songQuery.length > 0 && (
                                <div className={cx('result')}>
                                    {songQuery.map((song) => (
                                        <div key={song.id} className={cx('music-item')}>
                                            <img
                                                className={cx('music-image')}
                                                alt={song.title}
                                                height="48"
                                                src={song.image || '/default_image.jpg'}
                                                width="48"
                                            />
                                            <div className={cx('music-info-left')}>
                                                <strong>{song.title}</strong>
                                                <span>{song.artist_info.name}</span>
                                            </div>
                                            {!isRegisterPremium && song.is_premium ? (
                                                <span className={cx('state-music')}>Premium</span>
                                            ) : (
                                                <div className={cx('music-info-center')}>{song.title}</div>
                                            )}

                                            <button
                                                className={cx('btn-add')}
                                                onClick={() => addSongToPlaylist(song.id, song.is_premium)}
                                            >
                                                Thêm
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Footer />
                        </section>

                        {/* update */}
                        {openModal && (
                            <div
                                aria-modal="true"
                                className={cx('modal-overlay')}
                                role="dialog"
                                onClick={() => setOpenModal(false)}
                            >
                                <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
                                    <div className={cx('modal-header')}>
                                        <h2 id="modal-title">Sửa thông tin chi tiết</h2>
                                        <button
                                            aria-label="Close modal"
                                            className={cx('close-btn')}
                                            onClick={() => setOpenModal(false)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className={cx('modal-body')}>
                                        <div className={cx('image-box')}>
                                            <label className={cx('upload-label')}>
                                                {selectedImage ? (
                                                    <img
                                                        alt="Selected"
                                                        height="64"
                                                        src={URL.createObjectURL(selectedImage)}
                                                        width="64"
                                                        className={cx('upload-image')}
                                                    />
                                                ) : playlistDetail?.image ? (
                                                    <img
                                                        alt="Playlist"
                                                        height="64"
                                                        src={playlistDetail.image}
                                                        width="64"
                                                        className={cx('upload-image')}
                                                    />
                                                ) : (
                                                    <span className={cx('music-icon')}>
                                                        <MusicIcon />
                                                    </span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>
                                        <div className={cx('inputs')}>
                                            <input
                                                aria-label="Playlist name"
                                                type="text"
                                                value={playlistData.name}
                                                onChange={(e) =>
                                                    setPlaylistData({ ...playlistData, name: e.target.value })
                                                }
                                            />
                                            <textarea
                                                aria-label="Playlist description"
                                                placeholder="Thêm phần mô tả không bắt buộc"
                                                value={playlistData.description}
                                                onChange={(e) =>
                                                    setPlaylistData({ ...playlistData, description: e.target.value })
                                                }
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className={cx('save-btn-wrapper')}>
                                        <button className={cx('save-btn')} type="button" onClick={handleSavePlaylist}>
                                            Lưu
                                        </button>
                                    </div>

                                    <p className={cx('modal-footer-text')}>
                                        Bằng cách tiếp tục, bạn đồng ý cho phép Spotify Clone truy cập vào hình ảnh bạn
                                        đã chọn để tải lên. Vui lòng đảm bảo bạn có quyền tải lên hình ảnh.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Playlist;
