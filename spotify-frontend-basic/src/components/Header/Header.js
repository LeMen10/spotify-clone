import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import request from '~/utils/request';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { SearchIcon } from '../Icons';
import PopupPremium from '../PopupPremium/PopupPremium';
import PremiumInfoPopup from '../PremiumInfoPopup/PremiumInfoPopup';

const cx = classNames.bind(styles);

const Header = ({ setCheckOnClickChat, setCheckOnClickChatGemini, onPremiumStatusChange }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [ShowPremiumInfoPopup, setShowPremiumInfoPopup] = useState(false);

    const handleOpenPremiumPopup = () => {
        setShowPremiumPopup(true);
    };

    const handleClosePremiumPopup = () => {
        setShowPremiumPopup(false);
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/user/get-user`);
                setUser(res.data.user);
            } catch (error) {
                // if (error.response?.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    const handleClick = () => {
        setCheckOnClickChat(() => true);
    };

    const handleClickGemini = () => {
        setCheckOnClickChatGemini(() => true);
    };

    const handleClickPremiumInfo = () => {
        setShowPremiumInfoPopup(true);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        navigate('/login');
        window.location.reload();
    };

    useEffect(() => {
        if (location.pathname !== '/search') {
            setSearchTerm('');
        }
    }, [location.pathname]);

    useEffect(() => {
        if (location.pathname === '/search' && searchTerm.trim() === '') {
            navigate('/search', { state: { rs: [] } });
        }
    }, [searchTerm, location.pathname, navigate]);

    const handleSearchKeyDown = async (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            const res = await request.get(`/api/songs/search?query=${encodeURIComponent(searchTerm)}`);
            navigate('/search', { state: { rs: res.data } });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const isPremiumActive = useCallback(() => {
        if (!user?.isPremium) return false;
        if (!user?.premiumDate || !user?.MonthPremium) return false;

        const today = new Date();
        const premiumDate = new Date(user.premiumDate);
        if (isNaN(premiumDate)) return false; // check day không hợp lệ
        // Day hết hạn: MonthPremium + premiumDate
        const expiryDate = new Date(premiumDate);
        expiryDate.setMonth(premiumDate.getMonth() + user.MonthPremium);

        return expiryDate >= today;
    }, [user]);

    useEffect(() => {
        if (user && user.isPremium) {
            (async () => {
                const isActive = isPremiumActive();
                console.log(isActive);
                onPremiumStatusChange(isActive); // Case còn hạn
                // case hết hạn (false)
                if (!isActive) {
                    try {
                        // Gọi API để đặt isPremium = False
                        await request.post('/api/premium/deactivate', { user_id: user.id });
                        // Update lại user sau khi deactivate
                        const res = await request.get('/api/user/get-user');
                        // setUser để run useEffect lần nữa
                        setUser(res.data.user);
                    } catch (error) {
                        console.error('Error deactivating premium:', error);
                    }
                }
            })();
        } else {
            onPremiumStatusChange(false); // Gửi false nếu không có user or isPremium = false
        }
    }, [user, isPremiumActive, onPremiumStatusChange]);

    return (
        <>
            {showPremiumPopup && (
                <PopupPremium
                    onClose={handleClosePremiumPopup}
                    userId={user?.id} // Truyền user ID vào PopupPremium
                />
            )}
            {ShowPremiumInfoPopup && <PremiumInfoPopup user={user} onClose={() => setShowPremiumInfoPopup(false)} />}
            <div className={cx('header')}>
                <div className={cx('logo')} onClick={() => navigate('/')}>
                    <h1>Spotify</h1>
                </div>
                <div className={cx('wrap-actions')}>
                    <div className={cx('search-bar')}>
                        <SearchIcon fill={'#b3b3b3'} width="20" height="20" />
                        <input
                            placeholder="Bạn muốn tìm nội dung gì?"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <button
                            type="reset"
                            aria-label="Clear search input"
                            className={cx('clear-btn')}
                            onClick={handleClearSearch}
                        >
                            ×
                        </button>
                    </div>
                    <div className={cx('actions')}>
                        {!isPremiumActive() && <button onClick={handleOpenPremiumPopup}>Khám phá Premium</button>}
                        {user && (
                            <div className={cx('user')}>
                                <span className={cx('logged')}>{user.username[0].toUpperCase()}</span>

                                <div className={cx('logged-dropdown-wrap')}>
                                    <ul className={cx('logged-dropdown-list')}>
                                        {user?.isPremium && (
                                            <li onClick={handleClickPremiumInfo} className={cx('logged-dropdown-item')}>
                                                <div className={cx('logged-dropdown-item-content')}>Premium info</div>
                                            </li>
                                        )}
                                        <li onClick={handleClick} className={cx('logged-dropdown-item')}>
                                            <div className={cx('logged-dropdown-item-content')}>General chat </div>
                                        </li>
                                        <li onClick={handleClickGemini} className={cx('logged-dropdown-item')}>
                                            <div className={cx('logged-dropdown-item-content')}>Gemini AI</div>
                                        </li>
                                        <li onClick={handleLogout} className={cx('logged-dropdown-item')}>
                                            <div className={cx('logged-dropdown-item-content')}>Log Out</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
