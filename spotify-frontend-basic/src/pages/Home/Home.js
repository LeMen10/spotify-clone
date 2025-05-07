import { useEffect, useState, useRef } from 'react';
import className from 'classnames/bind';
import styles from './Home.module.scss';
import request from '~/utils/request';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import images from '~/assets/images/images';
import { PlusIcon } from '~/components/Icons';
import Cookies from 'js-cookie';
import Footer from '~/components/Footer/Footer';

const cx = className.bind(styles);

const Home = ({ onPlaylistAction, currentSongID, isRegisterPremium }) => {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/songs/top/`);
                setSongs(res.data);
            } catch (error) {
                // if (error.response?.status === 401) navigate('/login');
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            }
        })();
    }, [navigate]);

    const getPlaylists = async (index, isPremium) => {
        if (!isRegisterPremium && isPremium)
            return toast.warning('Đăng ký Premium để có thể thêm vào Playlist của bạn !!!');
        try {
            const res = await request.get('/api/playlists/get-playlists');
            setPlaylists(res.data);

            setActiveMenuIndex(index);
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePlaySingleSong = (song, isPremium) => {
        if (!isRegisterPremium && isPremium)
            return toast.warning('Đăng ký Premium để tận hưởng trọn vẹn bài hát này nhé !!!');
        const reorderedSongs = [song, ...songs.filter((s) => s.id !== song.id)];
        onPlaylistAction({ type: 'PLAY_SINGLE_SONG', data: reorderedSongs, currentSongID: song.id });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    };

    const topArr = [
        {
            title: 'Top 50 Việt Nam',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topVietnam}`,
        },
        {
            title: 'Top 50 global',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topGlobal}`,
        },
        {
            title: 'Top 50 Year',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.top50Year}`,
        },
        {
            title: 'Top 50 Morocco',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topMorocco}`,
        },
        {
            title: 'Top 50 India',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topIndia}`,
        },
        {
            title: 'Top 50 Canada',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topCanada}`,
        },
        {
            title: 'Top 50 NewZealand',
            subtitle: 'Ra mắt sắp tới',
            image: `${images.topNewZealand}`,
        },
    ];

    const handleCreatePlaylist = async (song_id) => {
        setActiveMenuIndex(null);
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('name', `Danh sách phát của tôi #${playlists.length + 1}`);

            const res = await request.post('/api/playlists/add-playlist', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            const playlistId = res.data.id;
            await onPlaylistAction('Playlist added');
            await handleAddToExistingPlaylist(playlistId, song_id);
            toast.success('Danh sách phát đã được thêm thành công');
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else toast.error('Không thêm được danh sách phát. Vui lòng thử lại.');
        }
    };

    const handleAddToExistingPlaylist = async (playlist_id, song_id) => {
        setActiveMenuIndex(null);
        const data = { playlist_id, song_id };
        try {
            await request.post(`/api/playlist/add-song/`, data);
            toast.success('Bài hát đã được thêm vào danh sách phát.');
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
            if (error.response.status === 400) toast.warning('Bài hát đã có trong danh sách');
        }
    };

    return (
        <>
            {isLoading ? (
                <div className={cx('spinner-wr')}>
                    <div className={cx('spinner')}></div>
                </div>
            ) : (
                <div className={cx('main-content')}>
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
                    <div className={cx('section')}>
                        <h2>Danh sách đứng đầu</h2>
                        <div className={cx('items')}>
                            {topArr.map((item) => (
                                <div className={cx('item')} key={item.title}>
                                    <img alt="" height="150" src={item.image} width="150" />
                                    <div className={cx('title')}>{item.title}</div>
                                    <div className={cx('subtitle')}>{item.subtitle}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cx('section')}>
                        <h2>Những bài hát có nhiều lượt nghe nhất</h2>
                        {songs.length > 0 && (
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
                                        {songs.map((song, index) => (
                                            <tr key={song.id}>
                                                <td
                                                    className={cx('song-title', {
                                                        active: currentSongID === song.id,
                                                    })}
                                                >
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <div className={cx('song-info-wr')}>
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
                                                        {!isRegisterPremium && song.is_premium && (
                                                            <span className={cx('state-music')}>Premium</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{formatTime(song.duration)}</td>
                                                <td>
                                                    <button
                                                        className={cx('btn-add')}
                                                        onClick={() => getPlaylists(index, song.is_premium)}
                                                    >
                                                        Thêm
                                                    </button>

                                                    {activeMenuIndex === index && (
                                                        <div className={cx('modal')}>
                                                            <div className={cx('modal__overlay')}></div>
                                                            <div className={cx('modal__body')}>
                                                                <nav
                                                                    className={cx('menu')}
                                                                    role="menu"
                                                                    aria-label="Context menu"
                                                                    ref={menuRef}
                                                                >
                                                                    <div
                                                                        className={cx('menu-item')}
                                                                        role="menuitem"
                                                                        onClick={() => handleCreatePlaylist(song.id)}
                                                                    >
                                                                        <PlusIcon />
                                                                        Thêm danh sách mới
                                                                    </div>
                                                                    {playlists.length > 0 &&
                                                                        playlists.map((item) => (
                                                                            <div
                                                                                key={item.id}
                                                                                className={cx('menu-item')}
                                                                                role="menuitem"
                                                                                onClick={() =>
                                                                                    handleAddToExistingPlaylist(
                                                                                        item.id,
                                                                                        song.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                {item.name}
                                                                            </div>
                                                                        ))}
                                                                </nav>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className={cx('section')}>
                        <Footer />
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;
