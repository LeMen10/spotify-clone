import React from 'react';
import styles from './PremiumInfoPopup.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const PremiumInfoPopup = ({ user, onClose }) => {
  // Tính ngày hết hạn
  const expiryDate = new Date(user.premiumDate);
  expiryDate.setMonth(expiryDate.getMonth() + user.MonthPremium);
  
  const benefits = [
    'Chất lượng âm thanh cao',
    'Phát nhạc mọi nơi',
    'Hỗ trợ ưu tiên'
  ];

  return (
    <div className={cx('overlay')} onClick={onClose}>
      <div className={cx('popup-container')} onClick={e => e.stopPropagation()}>
        <button className={cx('close-btn')} onClick={onClose}>×</button>
        
        <div className={cx('header')}>
          <div className={cx('badge')}>PREMIUM</div>
          <h2>Tài khoản Spotify Premium</h2>
          <p>Cảm ơn bạn đã sử dụng dịch vụ</p>
        </div>

        <div className={cx('user-info')}>
          <div className={cx('avatar')}>
            {user.avatar ? (
              <img src={user.avatar} alt="User avatar" />
            ) : (
              <span>{user.username[0].toUpperCase()}</span>
            )}
          </div>
          <div className={cx('details')}>
            <h3>{user.username}</h3>
            <p>{user.mail}</p>
          </div>
        </div>

        <div className={cx('subscription-info')}>
          <div className={cx('info-row')}>
            <span>Gói dịch vụ:</span>
            <strong>Premium 1 tháng</strong>
          </div>
          <div className={cx('info-row')}>
            <span>Ngày đăng ký:</span>
            <strong>{new Date(user.premiumDate).toLocaleDateString()}</strong>
          </div>
          <div className={cx('info-row')}>
            <span>Ngày hết hạn:</span>
            <strong>{expiryDate.toLocaleDateString()}</strong>
          </div>
          <div className={cx('info-row')}>
            <span>Phương thức thanh toán:</span>
            <strong>Momo</strong>
          </div>
        </div>

        <div className={cx('benefits')}>
          <h3>Quyền lợi của bạn</h3>
          <ul>
            {benefits.map((benefit, index) => (
              <li key={index}>
                <span className={cx('check-icon')}>✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PremiumInfoPopup;