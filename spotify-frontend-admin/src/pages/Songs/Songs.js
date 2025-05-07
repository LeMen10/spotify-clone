import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Songs.module.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';
import axios from 'axios';
import Cookies from 'js-cookie';

const cx = className.bind(styles);

const Songs = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [songIdToDelete, setSongIdDelete] = useState();
    const [pageCount, setPageCount] = useState();
    const [currentPageSong, setCurrentPageSong] = useState();

    const [title, setTitle] = useState('');
    const [selectedArtist, setSelectedArtist] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [songs, setSongs] = useState([]);

    const [modalType, setModalType] = useState(null);
    const [songToEdit, setSongToEdit] = useState(null);
    const [stateMusic, setStateMusic] = useState(false);

    const postsPerPage = 10;

    const getSongs = async (currentPage) => {
        try {
            const res = await request.get(`/api/admin/get-songs?page=${currentPage}&limit=${postsPerPage}`);

            setSongs(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const [artistRes, genreRes] = await Promise.all([
                    request.get('/api/admin/get-artists'),
                    request.get('/api/admin/get-genres'),
                ]);
                setArtists(artistRes.data);
                setGenres(genreRes.data);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/get-songs`);
                setSongs(res.data);
                setPageCount(res.page_count);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    const handleCheckDelete = (event) => {
        const targetId = event.currentTarget.dataset.id;
        setCheckedDelete(!checkedDelete);
        setSongIdDelete(targetId);
    };

    const handleDeleteSong = async () => {
        try {
            await request.delete_method(`/api/admin/delete-song/${songIdToDelete}`);
            setCheckedDelete(!checkedDelete);
            getSongs(currentPageSong || 1);
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    const handleAddSong = async () => {
        if (!title || !selectedArtist || !selectedGenre || !duration || !releaseDate || !audioFile) {
            return toast.error('Please fill in all information!');
        }

        const token = Cookies.get('token_admin');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('release_date', releaseDate);
        formData.append('artist_id', selectedArtist);
        formData.append('genre_id', selectedGenre);
        formData.append('audio_file', audioFile);
        formData.append('image_file', imageFile);
        formData.append('is_premium', stateMusic ? 'true' : 'false');

        try {
            const res = await fetch(`${process.env.REACT_APP_BASE_URL}api/admin/add-song`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setTitle('');
                setSelectedArtist('');
                setSelectedGenre('');
                setDuration('');
                setReleaseDate('');
                setAudioFile(null);
                setImageFile(null);
                setModalType(null);
                setStateMusic(false);
                getSongs(currentPageSong || 1);
                toast.success('Add song successfully!');
            } else {
                await res.json();
            }
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    const handlePageClick = (event) => {
        let currentPage = event.selected + 1;
        getSongs(currentPage);
        setCurrentPageSong(currentPage);
    };

    const handleUpdateSong = async () => {
        if (!title || !selectedArtist || !selectedGenre || !duration || !releaseDate) return;
        const token = Cookies.get('token_admin');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('release_date', releaseDate);
        formData.append('artist_id', selectedArtist);
        formData.append('genre_id', selectedGenre);
        formData.append('is_premium', stateMusic ? 'true' : 'false');
        if (audioFile) formData.append('audio_file', audioFile);
        if (imageFile) formData.append('image_file', imageFile);

        try {
            const res = await axios.put(
                `${process.env.REACT_APP_BASE_URL}api/admin/update-song/${songToEdit.id}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const updated = res.data;
            setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setModalType(null);
            setSongToEdit(null);
            toast.success('Update song successfully!');
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    return (
        <div className={cx('container_m')}>
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

            <div className={cx('mt-4', 'mb-4', 'pd-top-20px')}>
                <div className={cx('action')}>
                    <div className={cx('action-container')}>
                        <div className={cx('actions-wrap')}>
                            <div className={cx('action-list')}>
                                <button
                                    className={cx('btn', 'btn--primary', 'mr-10')}
                                    onClick={() => {
                                        setModalType('add');
                                        setTitle('');
                                        setDuration('');
                                        setReleaseDate('');
                                        setSelectedArtist('');
                                        setSelectedGenre('');
                                        setAudioFile(null);
                                        setSongToEdit(null);
                                        setStateMusic(false);
                                    }}
                                >
                                    Add song
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('table-wrap', 'mt-4')}>
                    <div className={cx('table-container')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th scope="col">Image</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Artist</th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Genre
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Release date
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Play count
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }}>
                                        Premium
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {songs.length > 0 &&
                                    songs.map((song) => (
                                        <tr key={song.id}>
                                            <td>
                                                {song.image && (
                                                    <img
                                                        src={song.image}
                                                        alt={song.title}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td>{song.title}</td>
                                            <td>{song.artist_info.name}</td>
                                            <td style={{ textAlign: 'center' }}>{song.genre_info.name}</td>
                                            <td style={{ textAlign: 'center' }}>{song.release_date}</td>
                                            <td style={{ textAlign: 'center' }}>{song.play_count}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span
                                                    className={cx('premium-status', {
                                                        premium: song.is_premium,
                                                        free: !song.is_premium,
                                                    })}
                                                >
                                                    {song.is_premium ? 'Premium' : 'Free'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={song.id}
                                                        onClick={handleCheckDelete}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        data-id={song.id}
                                                        onClick={() => {
                                                            setModalType('edit');
                                                            setSongToEdit(song);
                                                            setTitle(song.title);
                                                            setDuration(song.duration);
                                                            setReleaseDate(song.release_date);
                                                            setSelectedArtist(song.artist_info.id);
                                                            setSelectedGenre(song.genre_info.id);
                                                            setAudioFile(null);
                                                            setImageFile(null);
                                                            setStateMusic(song.is_premium);
                                                        }}
                                                    >
                                                        <UpdateIcon fill={'#1b8fd7'} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pageCount > 0 && (
                    <div className={styles['pagination-container']}>
                        <ReactPaginate
                            onPageChange={handlePageClick}
                            previousLabel={'<'}
                            breakLabel={'...'}
                            nextLabel={'>'}
                            pageCount={pageCount}
                            marginPagesDisplayed={3}
                            pageRangeDisplayed={3}
                            containerClassName={'pagination_custom'}
                            pageClassName={'page-item_custom'}
                            pageLinkClassName={'page-link_custom'}
                            previousClassName={'page-item_custom'}
                            previousLinkClassName={'page-link_custom'}
                            nextClassName={'page-item_custom'}
                            nextLinkClassName={'page-link_custom'}
                        />
                    </div>
                )}
            </div>

            {checkedDelete && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')}></div>
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container', 'js-modal-container-login')}>
                                <div className={cx('auth-form__header')}>
                                    <TrashIcon fill={'#ff5556'} />
                                </div>

                                <div>
                                    <h3>Are you sure!</h3>
                                    <p>
                                        Do you really want to permanently delete this product? You cannot restore this
                                        product if you delete it permanently!
                                    </p>
                                </div>

                                <div className={cx('auth-form__control')}>
                                    <Link
                                        to={'/songs'}
                                        onClick={() => setCheckedDelete(false)}
                                        className={cx('btn', 'auth-form__control-back', 'btn--normal')}
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (songIdToDelete) handleDeleteSong();
                                        }}
                                        value="login"
                                        className={cx('btn', 'btn--primary', 'view-cart')}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'ADD SONG' : 'UPDATE SONG'}
                                </h3>
                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="imageFile">
                                        image {modalType !== 'add' && '(no need if not changed)'}
                                    </label>
                                    <input
                                        type="file"
                                        className={cx('form-control-input')}
                                        id="imageFile"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                    />
                                    {songToEdit?.image_url && !imageFile && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img
                                                src={songToEdit.image_url}
                                                alt="Current song"
                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={cx('auth-form__group', 'mb-8')}>
                                    <div className={cx('width-46')}>
                                        <div className={cx('form-group', 'mb-8')}>
                                            <label htmlFor="title">title</label>
                                            <input
                                                type="text"
                                                className={cx('form-control-input')}
                                                name="title"
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={cx('width-46')}>
                                        <label htmlFor="title">state</label>
                                        <div className={cx('auth-form__sex-choice')}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="stateMusic"
                                                    value={true}
                                                    checked={stateMusic === true}
                                                    onChange={() => setStateMusic(true)}
                                                />
                                                Premium
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="stateMusic"
                                                    value={false}
                                                    checked={stateMusic === false}
                                                    onChange={() => setStateMusic(false)}
                                                />
                                                Free
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('auth-form__group', 'mb-8')}>
                                    <div className={cx('width-46')}>
                                        <div className={cx('form-group')}>
                                            <label htmlFor="releaseDate">release date</label>
                                            <input
                                                type="date"
                                                className={cx('form-control-input')}
                                                id="releaseDate"
                                                value={releaseDate}
                                                onChange={(e) => setReleaseDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={cx('width-46')}>
                                        <div className={cx('form-group')}>
                                            <label htmlFor="duration">duration (s)</label>
                                            <input
                                                type="number"
                                                className={cx('form-control-input')}
                                                id="duration"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('auth-form__group', 'mb-8')}>
                                    <div className={cx('width-46')}>
                                        <div className={cx('form-group', 'mb-8')}>
                                            <label htmlFor="artist">artist</label>
                                            <select
                                                id="artist"
                                                className={cx('form-control-input')}
                                                value={selectedArtist}
                                                onChange={(e) => setSelectedArtist(e.target.value)}
                                            >
                                                <option value="">-- Choose the artist --</option>
                                                {artists.map((artist) => (
                                                    <option key={artist.id} value={artist.id}>
                                                        {artist.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={cx('width-46')}>
                                        <div className={cx('form-group', 'mb-8')}>
                                            <label htmlFor="genre">genre</label>
                                            <select
                                                id="genre"
                                                className={cx('form-control-input')}
                                                value={selectedGenre}
                                                onChange={(e) => setSelectedGenre(e.target.value)}
                                            >
                                                <option value="">-- Choose the genre --</option>
                                                {genres.map((genre) => (
                                                    <option key={genre.id} value={genre.id}>
                                                        {genre.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('form-group', 'mb-8')}>
                                    <label htmlFor="audioFile">
                                        audio file {modalType !== 'add' && '(no need if not changed)'}
                                    </label>
                                    <input
                                        type="file"
                                        className={cx('form-control-input')}
                                        id="audioFile"
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files[0])}
                                    />
                                </div>

                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => {
                                            setModalType(null);
                                            setSongToEdit(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={cx('btn', 'btn--primary')}
                                        onClick={() => {
                                            modalType === 'add' ? handleAddSong() : handleUpdateSong();
                                        }}
                                    >
                                        {modalType === 'add' ? 'OK' : 'Update'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Songs;
