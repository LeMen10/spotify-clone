import { useState, useEffect } from 'react';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Artists.module.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';

const cx = className.bind(styles);

const Artists = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [productIdDelete, setProductIdDelete] = useState();
    const [pageCount, setPageCount] = useState();
    const [currentPageArtists, setCurrentPageArtists] = useState();
    const [artists, setArtists] = useState([]);
    const [modalType, setModalType] = useState(null); // 'add', 'update', or null
    const [artistFormData, setArtistFormData] = useState({ id: null, name: '' });

    const postsPerPage = 6;

    const getArtists = async (currentPage) => {
        try {
            const res = await request.get(`/api/admin/get-artists-by-limit?page=${currentPage}&limit=${postsPerPage}`);
            setArtists(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get('/api/admin/get-artists-by-limit');
                setArtists(res.data);
                setPageCount(res.page_count);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    const handleSaveArtist = async () => {
        if (!artistFormData.name.trim()) return toast.error('Please enter artist name');

        try {
            if (modalType === 'add') {
                const data = await request.post('/api/admin/add-artist', { name: artistFormData.name });
                setArtists([...artists, data]);
                toast.success('Create artist successful');
                getArtists(currentPageArtists || 1);
            } else if (modalType === 'update') {
                const data = await request.put(`/api/admin/update-artist/${artistFormData.id}`, {
                    name: artistFormData.name,
                });
                setArtists(artists.map((artist) => (artist.id === data.id ? data : artist)));
                toast.success('Update artist successful');
            }
            setModalType(null);
            setArtistFormData({ id: null, name: '' });
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else toast.error(`Could not ${modalType === 'add' ? 'add' : 'update'} artist. Please try again.`);
        }
    };

    const handleDeleteArtist = async () => {
        if (!productIdDelete) return;
        try {
            await request.delete_method(`/api/admin/delete-artist/${productIdDelete}`);
            setArtists(artists.filter((artist) => artist.id !== parseInt(productIdDelete)));
            setCheckedDelete(false);
            setProductIdDelete(null);
            toast.success('Delete artist successfully');
            getArtists(currentPageArtists || 1);
        } catch (error) {
            if (error.response?.status === 401) return navigate('/login');
            toast.error('Artist could not be removed. Please try again.');
        }
    };

    // Hàm mở modal update
    const handleEditArtist = (artist) => {
        setArtistFormData({ id: artist.id, name: artist.name });
        setModalType('update');
    };

    // Hàm xử lý checkbox xóa
    const handleCheckDelete = (event) => {
        const targetId = event.currentTarget.dataset.id;
        setCheckedDelete(!checkedDelete);
        setProductIdDelete(targetId);
    };

    // Hàm xử lý pagination
    const handlePageClick = (event) => {
        let currentPage = event.selected + 1;
        getArtists(currentPage);
        setCurrentPageArtists(currentPage);
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
                                        setArtistFormData({ id: null, name: '' });
                                        setModalType('add');
                                    }}
                                >
                                    Add Artist
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
                                    <th scope="col">artist</th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {artists.length > 0 && (
                                    artists.map((artist) => (
                                        <tr key={artist.id}>
                                            <td>{artist.name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={artist.id}
                                                        onClick={(e) => handleCheckDelete(e)}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEditArtist(artist)}
                                                    >
                                                        <UpdateIcon fill={'#1b8fd7'} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                    <div className={cx('modal__overlay')} onClick={() => setCheckedDelete(false)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <div className={cx('auth-form__header')}>
                                    <TrashIcon fill={'#ff5556'} />
                                </div>
                                <div>
                                    <h3>Are you sure!</h3>
                                    <p>
                                        Do you really want to permanently delete this artist? You cannot restore this
                                        artist after deletion!
                                    </p>
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setCheckedDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleDeleteArtist}>
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal add/update Artist */}
            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} onClick={() => setModalType(null)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'Create artist' : 'Update artist'}
                                </h3>
                                <div className={cx('form-group')}>
                                    <label htmlFor="artistName">name</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="artistName"
                                        value={artistFormData.name}
                                        onChange={(e) => setArtistFormData({ ...artistFormData, name: e.target.value })}
                                    />
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setModalType(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleSaveArtist}>
                                        Save
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

export default Artists;
