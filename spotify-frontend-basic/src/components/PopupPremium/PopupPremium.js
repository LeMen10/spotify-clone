import React, { useState } from 'react';
import styles from './PopupPremium.module.scss';
import classNames from 'classnames/bind';
import axios from 'axios';
import images from '~/assets/images/images';

const cx = classNames.bind(styles);

const PopupPremium = ({ onClose, userId }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleMomoPayment = async () => {
        if (!userId) {
            
            setPaymentError('Vui lòng đăng nhập để sử dụng tính năng này');
            return;
        }
        setIsProcessing(true);
        setPaymentError(null);
       
        try {
            const response = await axios.post('http://localhost:3001/payment', {
                amount: 20000,
                orderIdSuffix: Date.now().toString(),
                accountId: userId || 'guest-' + Math.random().toString(36).substring(2, 9)
            });

            if (response.data && response.data.payUrl) {
                window.location.href = response.data.payUrl;
            } else {
                throw new Error('Không nhận được URL thanh toán từ MoMo');
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            setPaymentError('Đã xảy ra lỗi khi khởi tạo thanh toán. Vui lòng thử lại sau.');
        } finally {
            setIsProcessing(false);
        }
    };

    const premiumFeatures = [
        {
            icon: '🚫',
            title: 'Nghe nhạc không quảng cáo',
            description: 'Trải nghiệm âm nhạc liền mạch không bị gián đoạn'
        },
        {
            icon: '🔊',
            title: 'Chất lượng âm thanh cao',
            description: 'Tận hưởng âm thanh lossless chất lượng cao'
        },
        {
            icon: '📱',
            title: 'Nghe nhạc ngoại tuyến',
            description: 'Tải xuống và nghe nhạc mọi lúc mọi nơi'
        },
        {
            icon: '⏭️',
            title: 'Bỏ qua không giới hạn',
            description: 'Chuyển bài hát thoải mái theo ý thích'
        }
    ];

    return (
        
        <div className={cx('overlay')} onClick={handleOverlayClick}>
            <div className={cx('popup')}>
                <div className={cx('header')}>
                    <div className={cx('badge')}>
                        <span className={cx('crown-icon')}>💎</span>
                        <span>ƯU ĐÃI ĐẶC BIỆT </span>
                    </div>
                    <button className={cx('close')} onClick={onClose}>×</button>
                </div>
                
                <div className={cx('content')}>
                    <div className={cx('hero-section')}>
                        <div className={cx('text-content')}>
                            <h1 className={cx('heading')}>
                                <span className={cx('highlight')}>Dùng thử Premium 2 tháng</span> chỉ với 20.000₫
                            </h1>
                            <p className={cx('subtext')}>Sau đó chỉ 20.000₫/tháng. Hủy bất cứ lúc nào.</p>
                            
                            <div className={cx('buttons')}>
                                <button 
                                    className={cx('primary')} 
                                    onClick={handleMomoPayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <span className={cx('button-content')}>
                                            <span className={cx('spinner')}></span>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        <span className={cx('button-content')}>
                                            Thanh toán với MoMo
                                        </span>
                                    )}
                                </button>
                                <button className={cx('secondary')} onClick={onClose}>Suy nghĩ thêm</button>
                            </div>

                            {paymentError && (
                                <div className={cx('error-message')}>
                                    {paymentError}
                                </div>
                            )}
                        </div>
                        
                        <div className={cx('image-container')}>
                            <img 
                                src={images.iconPremium}
                                alt="Premium Music" 
                                className={cx('premium-image')}
                            />
                            <div className={cx('pulse-effect')}></div>
                        </div>
                    </div>
                    
                    <div className={cx('features')}>
                        <h2 className={cx('features-title')}>Trải nghiệm âm nhạc đẳng cấp với Premium</h2>
                        <div className={cx('features-grid')}>
                            {premiumFeatures.map((feature, index) => (
                                <div key={index} className={cx('feature-card')}>
                                    <div className={cx('feature-icon-container')}>
                                        <span className={cx('feature-icon')}>{feature.icon}</span>
                                        <div className={cx('icon-hover-effect')}></div>
                                    </div>
                                    <h3 className={cx('feature-title')}>{feature.title}</h3>
                                    <p className={cx('feature-desc')}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className={cx('testimonials')}>
                        <h3 className={cx('testimonial-title')}>Người dùng nói gì về chúng tôi</h3>
                        <div className={cx('testimonial-cards')}>
                            <div className={cx('testimonial')}>
                                <div className={cx('user-avatar-container')}>
                                    <img 
                                        src="https://randomuser.me/api/portraits/women/32.jpg" 
                                        alt="User" 
                                        className={cx('user-avatar')}
                                    />
                                    <div className={cx('avatar-halo')}></div>
                                </div>
                                <p>"Chất lượng âm thanh tuyệt vời, xứng đáng với mỗi đồng bỏ ra!"</p>
                                <span>- Mai Anh</span>
                            </div>
                            <div className={cx('testimonial')}>
                                <div className={cx('user-avatar-container')}>
                                    <img 
                                        src="https://randomuser.me/api/portraits/men/44.jpg" 
                                        alt="User" 
                                        className={cx('user-avatar')}
                                    />
                                    <div className={cx('avatar-halo')}></div>
                                </div>
                                <p>"Tôi đã nghe nhạc mọi lúc mọi nơi mà không lo về dữ liệu."</p>
                                <span>- Minh Quang</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className={cx('note')}>
                        *20.000₫ cho 2 tháng, sau đó là 20.000₫/tháng. Chỉ áp dụng cho tài khoản chưa từng sử dụng gói Premium. <p>Điều khoản áp dụng</p>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PopupPremium;