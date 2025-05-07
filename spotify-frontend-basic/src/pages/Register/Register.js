import { Fragment, useState } from 'react';
import className from 'classnames/bind';
import axios from 'axios';
import styles from './Register.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import images from '~/assets/images/images';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = className.bind(styles);

const Register = () => {
    const [username, setUserName] = useState('');
    const [fullName, setFullname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');

    const handleGenderChange = (event) => {
        setGender(event.target.value);
    };

    const navigate = useNavigate();

    const toastCustom = (message) => {
        toast.warn(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
        });
    };

    const handleSubmit = () => {
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        const data = {
            fullname: fullName,
            username,
            password,
            email,
            profile_pic: gender === 'male' ? boyProfilePic : girlProfilePic,
        };
        axios
            .post(`${process.env.REACT_APP_BASE_URL}api/auth/register`, data)
            .then((res) => {
                if (res.status === 201) navigate('/login');
            })
            .catch((error) => {
                const err = error.response.data.error;
                if (err === 'username already exists') toastCustom('Username already exists');
            });
    };

    return (
        <Fragment>
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
            <div className={cx('modal', 'js-modal-register')}>
                <div className={cx('modal__overlay')}>
                    <img style={{ width: '100%', height: '100%' }} src={images.f8Login} alt="" />
                </div>
                <div className={cx('modal__body')}>
                    <div className={cx('auth-form ')}>
                        <div className={cx('auth-form__container', 'js-modal-container')}>
                            <div className={cx('auth-form__header')}>
                                <h3 className={cx('auth-form__heading')}>Register</h3>
                                <Link to={'/login'} className={cx('auth-form__switch-btn', 'js-login ')}>
                                    Login
                                </Link>
                            </div>

                            <div className={cx('auth-form__form')}>
                                <div className={cx('auth-form__group')}>
                                    <div className={cx('with-46')}>
                                        <input
                                            type="text"
                                            autocomplete="off"
                                            name="fullname"
                                            placeholder="fullname"
                                            className={cx('auth-form__input')}
                                            id="auth-form__fullname"
                                            value={fullName}
                                            onChange={(e) => setFullname(e.target.value)}
                                        />
                                        <div className={cx('error')}></div>
                                    </div>
                                    <div className={cx('with-46')}>
                                        <input
                                            type="text"
                                            autocomplete="off"
                                            name="username"
                                            placeholder="username"
                                            className={cx('auth-form__input')}
                                            id="auth-form__username"
                                            value={username}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                        <div className={cx('error')}></div>
                                    </div>
                                </div>

                                <div className={cx('auth-form__group')}>
                                    <div className={cx('with-46')}>
                                        <input
                                            type="password"
                                            autocomplete="off"
                                            name="password"
                                            placeholder="password"
                                            className={cx('auth-form__input')}
                                            id="auth-form__password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className={cx('error')}></div>
                                    </div>
                                    <div className={cx('with-46')}>
                                        <input
                                            type="password"
                                            name="Confirm password"
                                            placeholder="confirm password"
                                            className={cx('auth-form__input')}
                                            id="auth-form__confirm-password"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <div className={cx('error')}></div>
                                    </div>
                                </div>

                                <div className={cx('auth-form__group')}>
                                    <div className={cx('with-46')}>
                                        <input
                                            type="text"
                                            autocomplete="off"
                                            name="email"
                                            placeholder="email"
                                            className={cx('auth-form__input')}
                                            id="auth-form__email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <div className={cx('error')}></div>
                                    </div>
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
                            </div>

                            <div className={cx('auth-form__aside')}>
                                <p className={cx('auth-form__policy-text')}>
                                    By signing up, you agree to Chat app's terms of use{' '}
                                    <Link to={''} className={cx('auth-form__text-link')}>
                                        Terms of Service
                                    </Link>{' '}
                                    &{' '}
                                    <Link to={''} className={cx('auth-form__text-link')}>
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>

                            <div className={cx('auth-form__control')}>
                                <Link to={'/login'} className={cx('btn', 'auth-form__control-back', 'btn--normal')}>
                                    Cancel
                                </Link>
                                <button
                                    className={cx('btn', 'btn--primary', 'view-cart')}
                                    onClick={handleSubmit}
                                    disabled={
                                        !username ||
                                        !password ||
                                        !confirmPassword ||
                                        !email ||
                                        !gender ||
                                        password !== confirmPassword
                                    }
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};
export default Register;
