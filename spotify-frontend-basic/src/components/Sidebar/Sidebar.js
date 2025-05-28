import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import * as request from '~/utils/request';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { PlusIcon, MusicIcon } from '~/components/Icons';
import Cookies from 'js-cookie';

const cx = classNames.bind(styles);

const Sidebar = ({ onPlaylistAction, playlists }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleAddDefaultPlaylist = async () => {
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
            onPlaylistAction('Playlist added');
            toast.success('Danh sách phát đã được thêm thành công');
            navigate(`/playlist/${res.id}`);
        } catch (error) {
            console.error('Error adding playlist:', error);
            if (error.response?.status === 401) navigate('/login');
            else toast.error('Không thêm được danh sách phát. Vui lòng thử lại.');
        }
    };

    return (
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
            <div className={cx('playlist')}>
                <div className={cx('library')}>
                    <div className={cx('title-library')}>
                        <h3>Thư viện</h3>
                        <div className={cx('library-icon-add')} onClick={handleAddDefaultPlaylist}>
                            <PlusIcon />
                        </div>
                    </div>

                    {playlists.length > 0 &&
                        playlists.map((item) => (
                            <div
                                key={item.id}
                                className={cx('library-item', { active: Number(id) === item.id })}
                                onClick={() => navigate(`/playlist/${item.id}`)}
                            >
                                {item.image ? (
                                    <img alt="" height="40" src={item.image} width="40" />
                                ) : (
                                    <span className={cx('music-icon')}>
                                        <MusicIcon />
                                    </span>
                                )}

                                <div>
                                    <div className={cx('playlist-title')}>{item.name}</div>
                                    <div>
                                        <span className={cx('playlist-type')}>Danh sách phát</span> •{' '}
                                        <span className={cx('playlist-user')}>{item.fullname}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
