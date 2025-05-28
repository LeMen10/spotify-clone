import classNames from 'classnames/bind';
import styles from './Welcome.module.scss';
import { Link } from 'react-router-dom';
import images from '~/assets/images/images';

const cx = classNames.bind(styles);

const Welcome = () => {

    return (
        <>
            <div className={cx('modal-overlay')}>
                <div className={cx('welcome-container')}>
                    <img alt="Spotify logo with a play button in the center" src={images.logoSp} />
                    <h1>Bắt đầu nghe bằng tài khoản Spotify Free</h1>
                    <span className={cx('btn', 'btn-white', 'register-btn')}>
                        <Link to="/register">Đăng ký miễn phí</Link>
                    </span>
                    <div className={cx('login')}>
                        Bạn đã có tài khoản?
                        <span className={cx('login-btn')}>
                            <Link to="/login">Đăng nhập</Link>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome;
