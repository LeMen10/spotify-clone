import { Fragment, useState } from 'react';
import className from 'classnames/bind';
import axios from 'axios';
import styles from './Login.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import images from '~/assets/images/images';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = className.bind(styles);

const Login = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);

    const toastCustom = (message) => {
        toast.warn(message, {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
        });
    };

    const handleSubmit = async () => {
        const data = { username, password };
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/login`, data);
            Cookies.set('token', res.data.access_token, { expires: expirationDate });

            navigate('/');
            window.location.reload();
        } catch (error) {
            const err = error.response.data.error;
            if (err === 'Invalid username or password') toastCustom('Invalid username or password');
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className={cx('modal')}>
                <div className={cx('modal__overlay')}>
                    <img style={{ width: '100%', height: '100%' }} src={images.f8Login} alt="" />
                </div>
                <div className={cx('modal__body')}>
                    <div className={cx('auth-form')}>
                        <div className={cx('auth-form__container', 'js-modal-container-login')}>
                            <div className={cx('auth-form__header')}>
                                <h3 className={cx('auth-form__heading')}>Login</h3>
                                <Link to={'/register'} className={cx('auth-form__switch-btn', 'js-register')}>
                                    Register
                                </Link>
                            </div>

                            <div className={cx('auth-form__form')}>
                                <div className={cx('auth-form__group')}>
                                    <div className={cx('width-46')}>
                                        <input
                                            type="text"
                                            placeholder="username"
                                            name="username"
                                            className={cx('auth-form__input')}
                                            id="auth-form__user-login"
                                            value={username}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                    </div>
                                    <div className={cx('width-46')}>
                                        <input
                                            type="password"
                                            placeholder="password"
                                            name="password"
                                            className={cx('auth-form__input')}
                                            id="auth-form__password-login"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={cx('auth-form__aside')}>
                                <p className={cx('auth-form__help')}>
                                    <Link
                                        to={'/forgot_password'}
                                        className={cx('auth-form__help-link', 'auth-form__help-forgot')}
                                    >
                                        Forgot password?
                                    </Link>
                                    <span className={cx('auth-form__help-separate')}></span>
                                    <Link to={''} href="" className={cx('auth-form__help-link')}>
                                        Need help?
                                    </Link>
                                </p>
                            </div>

                            <div className={cx('auth-form__control')}>
                                <button
                                    value="login"
                                    className={cx('btn', 'btn--primary', 'view-cart')}
                                    onClick={handleSubmit}
                                    disabled={!username || !password}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
