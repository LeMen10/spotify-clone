import { useState, useEffect } from 'react';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Genres.module.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';

const cx = className.bind(styles);

const Genres = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [productIdDelete, setProductIdDelete] = useState();
    const [pageCount, setPageCount] = useState();
    const [currentPageGenres, setCurrentPageGenres] = useState();
    const [genres, setGenres] = useState([]);
    const [modalType, setModalType] = useState(null); // 'add', 'update', or null
    const [genreFormData, setGenreFormData] = useState({ id: null, name: '' });

    const postsPerPage = 6;

    const getGenres = async (currentPage) => {
        try {
            const res = await request.get(`/api/admin/get-genres-by-limit?page=${currentPage}&limit=${postsPerPage}`);
            setGenres(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            if (error.response.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get('/api/admin/get-genres-by-limit');
                setGenres(res.data);
                setPageCount(res.page_count);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    // Hàm lưu add/update genre
    const handleSaveGenre = async () => {
        if (!genreFormData.name.trim()) return toast.error('Please enter genres name!!');

        try {
            if (modalType === 'add') {
                const data = await request.post('/api/admin/add-genre', { name: genreFormData.name });
                setGenres([...genres, data]);
                toast.success('Create genres successful.');
                getGenres(currentPageGenres || 1);
            } else if (modalType === 'update') {
                const data = await request.put(`/api/admin/update-genre/${genreFormData.id}`, {
                    name: genreFormData.name,
                });
                setGenres(genres.map((genre) => (genre.id === data.id ? data : genre)));
                toast.success('Update genres successful.');
            }
            setModalType(null);
            setGenreFormData({ id: null, name: '' });
        } catch (error) {
            console.error(`Error ${modalType === 'add' ? 'adding' : 'updating'} genre:`, error);
            if (error.response?.status === 401) navigate('/login');
            else toast.error(`Could not ${modalType === 'add' ? 'add' : 'update'} genres. Please try again.`);
        }
    };

    // Hàm xóa genre
    const handleDeleteGenre = async () => {
        if (!productIdDelete) return;
        try {
            await request.delete_method(`/api/admin/delete-genre/${productIdDelete}`);
            setGenres(genres.filter((genre) => genre.id !== parseInt(productIdDelete)));
            setCheckedDelete(false);
            setProductIdDelete(null);
            getGenres(currentPageGenres || 1);
            toast.success('Deleted genres and related songs successfully!');
        } catch (error) {
            console.error('Error deleting genre:', error);
            if (error.response?.status === 401) navigate('/login');
            else toast.error('Unable to delete category. Please try again.');
        }
    };

    // Hàm mở modal update
    const handleEditGenre = (genre) => {
        setGenreFormData({ id: genre.id, name: genre.name });
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
        getGenres(currentPage);
        setCurrentPageGenres(currentPage);
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
                                        setGenreFormData({ id: null, name: '' });
                                        setModalType('add');
                                    }}
                                >
                                    Add Genre
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
                                    <th scope="col">genre</th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {genres.length > 0 && (
                                    genres.map((genre) => (
                                        <tr key={genre.id}>
                                            <td>{genre.name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={genre.id}
                                                        onClick={(e) => handleCheckDelete(e)}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEditGenre(genre)}
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

            {/* Modal delete genres */}
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
                                        Are you sure you want to permanently delete this category? All related songs
                                        will also be deleted and cannot be restored!
                                    </p>
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setCheckedDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleDeleteGenre}>
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal add/update genres */}
            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} onClick={() => setModalType(null)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'CREATE GENRES' : 'UPDATE GENRES'}
                                </h3>
                                <div className={cx('form-group')}>
                                    <label htmlFor="genreName">name</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="genreName"
                                        value={genreFormData.name}
                                        onChange={(e) => setGenreFormData({ ...genreFormData, name: e.target.value })}
                                    />
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setModalType(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleSaveGenre}>
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

export default Genres;
