import { useState, useEffect } from 'react';
import { TrashIcon, UpdateIcon } from '~/components/Icons';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Users.module.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as request from '~/utils/request';
import Cookies from 'js-cookie';

const cx = className.bind(styles);

const Users = () => {
    const navigate = useNavigate();
    const [checkedDelete, setCheckedDelete] = useState(false);
    const [productIdDelete, setProductIdDelete] = useState();
    const [pageCount, setPageCount] = useState(0);
    const [currentPageUser, setCurrentPageUser] = useState(1);
    const [users, setUsers] = useState([]);
    const [modalType, setModalType] = useState(null); // 'add', 'update', or null
    const [gender, setGender] = useState('');
    const [userFormData, setUserFormData] = useState({
        id: null,
        username: '',
        email: '',
        password: '',
        fullname: '',
        profile_pic: '',
    });

    const postsPerPage = 8;

    useEffect(() => {
        const pic =
            gender === 'male'
                ? `https://avatar.iran.liara.run/public/boy?username=${userFormData.username}`
                : `https://avatar.iran.liara.run/public/girl?username=${userFormData.username}`;

        setUserFormData((prev) => ({
            ...prev,
            profile_pic: pic,
        }));
    }, [userFormData.username, gender]);

    const getUsers = async (page) => {
        try {
            const res = await request.get(`/api/admin/get-users?page=${page}&limit=${postsPerPage}`);
            setUsers(res.data);
            setPageCount(res.page_count);
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get('/api/admin/get-users');
                setUsers(res.data);
                setPageCount(res.page_count);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    const handleSaveUser = async () => {
        const token = Cookies.get('token_admin');
        if (
            !userFormData.username.trim() ||
            !userFormData.email.trim() ||
            !userFormData.fullname.trim() ||
            !userFormData.profile_pic
        ) {
            return toast.error('Please fill in all required fields');
        }
        if (modalType === 'add' && !userFormData.password.trim()) {
            return toast.error('Please enter a password for the new user');
        }

        try {
            const formData = new FormData();
            formData.append('username', userFormData.username);
            formData.append('email', userFormData.email);
            formData.append('fullname', userFormData.fullname);
            if (userFormData.password) formData.append('password', userFormData.password);
            if (userFormData.profile_pic) formData.append('profile_pic', userFormData.profile_pic);

            if (modalType === 'add') {
                const data = await request.post('/api/admin/add-user', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUsers([...users, data]);
                getUsers(currentPageUser || 1);
                toast.success('User added successfully');
            } else if (modalType === 'update') {
                const data = await request.put(`/api/admin/update-user/${userFormData.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(users.map((user) => (user.id === data.id ? data : user)));
                toast.success('User updated successfully');
            }
            setModalType(null);
            setUserFormData({
                id: null,
                username: '',
                email: '',
                password: '',
                fullname: '',
                profile_pic: null
            });
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else {
                toast.error(`Failed to ${modalType === 'add' ? 'add' : 'update'} user. Please try again.`);
            }
        }
    };

    const handleDeleteUser = async () => {
        if (!productIdDelete) return;
        try {
            await request.delete_method(`/api/admin/delete-user/${productIdDelete}`);
            setUsers(users.filter((user) => user.id !== parseInt(productIdDelete)));
            setCheckedDelete(false);
            setProductIdDelete(null);
            getUsers(currentPageUser || 1);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.response?.status === 401) navigate('/login');
            else toast.error('Failed to delete user. Please try again.');
        }
    };

    // Hàm mở modal cập nhật
    const handleEditUser = (user) => {
        setUserFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            password: '',
            fullname: user.fullname,
            profile_pic: null
        });
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
        const currentPage = event.selected + 1;
        getUsers(currentPage);
        setCurrentPageUser(currentPage);
    };

    const handleGenderChange = (event) => {
        setGender(event.target.value);
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
                                        setUserFormData({
                                            id: null,
                                            username: '',
                                            email: '',
                                            password: '',
                                            fullname: '',
                                            profile_pic: null,
                                        });
                                        setModalType('add');
                                    }}
                                >
                                    Add User
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
                                    <th scope="col">username</th>
                                    <th scope="col">email</th>
                                    <th scope="col">fullname</th>
                                    <th scope="col">active</th>
                                    <th scope="col">role</th>
                                    <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                        action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 &&
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.fullname}</td>
                                            <td>{user.is_active ? 'Yes' : 'No'}</td>
                                            <td>{user.role}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <span
                                                        className={cx('btn-delete')}
                                                        data-id={user.id}
                                                        onClick={
                                                            user.role === 'admin'
                                                                ? undefined
                                                                : (e) => handleCheckDelete(e)
                                                        }
                                                        style={{
                                                            pointerEvents: user.role === 'admin' ? 'none' : 'auto',
                                                            opacity: user.role === 'admin' ? 0.5 : 1,
                                                            cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                                                        }}
                                                    >
                                                        <TrashIcon fill={'#eb5959'} />
                                                    </span>
                                                    <div
                                                        className={cx('btn-edit')}
                                                        onClick={
                                                            user.role === 'admin'
                                                                ? undefined
                                                                : () => handleEditUser(user)
                                                        }
                                                        style={{
                                                            pointerEvents: user.role === 'admin' ? 'none' : 'auto',
                                                            opacity: user.role === 'admin' ? 0.5 : 1,
                                                            cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
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

            {/* Modal delete user */}
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
                                    <h3>Are you sure?</h3>
                                    <p>
                                        Do you really want to permanently delete this user? This action cannot be
                                        undone!
                                    </p>
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setCheckedDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleDeleteUser}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal add/update */}
            {modalType && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')} onClick={() => setModalType(null)} />
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <h3 className={cx('auth-form__header')}>
                                    {modalType === 'add' ? 'ADD USER' : 'UPDATE USER'}
                                </h3>
                                <div className={cx('form-group')}>
                                    <label htmlFor="username">username</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="username"
                                        value={userFormData.username}
                                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="email">email</label>
                                    <input
                                        type="email"
                                        className={cx('form-control-input')}
                                        id="email"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="password">
                                        password {modalType === 'update' && '(leave blank if unchanged)'}
                                    </label>
                                    <input
                                        type="password"
                                        className={cx('form-control-input')}
                                        id="password"
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="fullname">fullname</label>
                                    <input
                                        type="text"
                                        className={cx('form-control-input')}
                                        id="fullname"
                                        value={userFormData.fullname}
                                        onChange={(e) => setUserFormData({ ...userFormData, fullname: e.target.value })}
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <div className={cx('auth-form__sex-choice', 'with-46')}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={gender === 'male'}
                                                onChange={handleGenderChange}
                                            />
                                            Male
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={gender === 'female'}
                                                onChange={handleGenderChange}
                                            />
                                            Female
                                        </label>
                                    </div>
                                </div>

                                <div className={cx('auth-form__control')}>
                                    <button
                                        className={cx('btn', 'btn--normal', 'mr-10')}
                                        onClick={() => setModalType(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button className={cx('btn', 'btn--primary')} onClick={handleSaveUser}>
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

export default Users;
