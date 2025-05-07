import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FacebookIcon, GithubIcon, LinkedinIcon } from '../Icons';

const cx = classNames.bind(styles);

const Footer = () => {
    return (
        <>
            <footer className={cx('footer-container')}  aria-label="Spotify footer">
                <div className={cx('footer-top')}>
                    <div className={cx('footer-column')}>
                        <h4>
                            <strong>Công ty</strong>
                        </h4>
                        <ul>
                            <li>
                                <p>Giới thiệu</p>
                            </li>
                            <li>
                                <p>Việc làm</p>
                            </li>
                            <li>
                                <p>For the Record</p>
                            </li>
                        </ul>
                    </div>
                    <div className={cx('footer-column')}>
                        <h4>
                            <strong>Cộng đồng</strong>
                        </h4>
                        <ul>
                            <li>
                                <p>Dành cho các Nghệ sĩ</p>
                            </li>
                            <li>
                                <p>Nhà phát triển</p>
                            </li>
                            <li>
                                <p>Quảng cáo</p>
                            </li>
                            <li>
                                <p>Nhà đầu tư</p>
                            </li>
                            <li>
                                <p>Nhà cung cấp</p>
                            </li>
                        </ul>
                    </div>
                    <div className={cx('footer-column')}>
                        <h4>
                            <strong>Liên kết hữu ích</strong>
                        </h4>
                        <ul>
                            <li>
                                <p>Hỗ trợ</p>
                            </li>
                            <li>
                                <p>Ứng dụng Di động Miễn phí</p>
                            </li>
                        </ul>
                    </div>
                    <div className={cx('footer-column')}>
                        <h4>
                            <strong>Các gói của Spotify</strong>
                        </h4>
                        <ul>
                            <li>
                                <p>Premium Individual</p>
                            </li>
                            <li>
                                <p>Premium Student</p>
                            </li>
                            <li>
                                <p>Spotify Free</p>
                            </li>
                        </ul>
                    </div>
                    <nav className={cx('footer-social')} aria-label="Social media links">
                        <p aria-label="Linkedin">
                            <LinkedinIcon fill={"#fff"} width='18' height='18'/>
                        </p>
                        <p aria-label="Twitter">
                            <GithubIcon fill={"#fff"} width='20' height='20'/>
                        </p>
                        <p aria-label="Facebook">
                            <FacebookIcon fill={"#fff"} width='20' height='20'/>
                        </p>
                    </nav>
                </div>
                <div className={cx('footer-bottom')} role="contentinfo">
                    <p>Pháp lý</p>
                    <p>Trung tâm an toàn và quyền riêng tư</p>
                    <p>Chính sách quyền riêng tư</p>
                    <p>Cookie</p>
                    <p>Giới thiệu Quảng cáo</p>
                    <p>Hỗ trợ tiếp cận</p>
                    <div className={cx('spacer')} aria-hidden="true"></div>
                    <span>© 2025 Spotify AB</span>
                </div>
            </footer>
        </>
    );
};

export default Footer;
