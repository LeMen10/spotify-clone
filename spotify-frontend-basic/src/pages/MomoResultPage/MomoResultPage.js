import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './MomoResultPage.module.scss';
import classNames from 'classnames/bind';
import request from '~/utils/request';

const cx = classNames.bind(styles);

const MomoResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Đang xác nhận kết quả thanh toán...');
    const [isLoading, setIsLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const accountId = queryParams.get('accountId');
        const orderId = queryParams.get('orderId');

        const verifyPayment = async () => {
            try {
                // 1. First verify the payment with MoMo
                const paymentResponse = await axios.post(`${process.env.MOMO_SERVER}/check-status-transaction`, {
                    orderId: `MOMO${orderId}`
                });

                if (paymentResponse.data.resultCode === 0) {
                    // Payment successful
                    setStatus('Thanh toán thành công!');
                    setPaymentInfo({
                        amount: paymentResponse.data.amount,
                        orderId: paymentResponse.data.orderId,
                        transId: paymentResponse.data.transId,
                        date: new Date().toLocaleString()
                    });

                    // 2. Update premium status on your server
                    try {
                        const premiumResponse = await request.post('/api/premium/activate', { user_id: accountId });
            
                        if (premiumResponse.data.success) {
                            console.log('Premium status updated successfully');
                        } else {
                            console.error('Failed to update premium status:', premiumResponse.data.error);
                            
                        }
                    } catch (error) {
                        console.error('Error updating premium status:', error);
                    }
                } else {
                    // Payment failed
                    setStatus(`Thanh toán không thành công: ${paymentResponse.data.message || 'Lỗi không xác định'}`);
                }
            } catch (error) {
                console.error('Lỗi xác nhận thanh toán:', error);
                setStatus('Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng kiểm tra lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [location]);

    return (
        <div className={cx('container')}>
            <div className={cx('result-card')}>
                {isLoading ? (
                    <div className={cx('loading-container')}>
                        <div className={cx('spinner')}></div>
                        <p>{status}</p>
                    </div>
                ) : (
                    <>
                        <div className={cx('status-icon', { success: paymentInfo })}>
                            {paymentInfo ? '✓' : '✗'}
                        </div>
                        <h2 className={cx('status-message')}>{status}</h2>
                        
                        {paymentInfo && (
                            <div className={cx('payment-details')}>
                                <h3>Thông tin giao dịch</h3>
                                <div className={cx('detail-row')}>
                                    <span>Số tiền:</span>
                                    <span>{paymentInfo.amount.toLocaleString()}₫</span>
                                </div>
                                <div className={cx('detail-row')}>
                                    <span>Mã giao dịch:</span>
                                    <span>{paymentInfo.transId}</span>
                                </div>
                                <div className={cx('detail-row')}>
                                    <span>Mã đơn hàng:</span>
                                    <span>{paymentInfo.orderId}</span>
                                </div>
                                <div className={cx('detail-row')}>
                                    <span>Thời gian:</span>
                                    <span>{paymentInfo.date}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            className={cx('action-button')}
                            onClick={() => navigate('/')}
                        >
                            Quay về trang chủ
                        </button>

                        {paymentInfo && (
                            <button 
                                className={cx('action-button', 'check-premium')}
                                onClick={() => navigate('/')}
                            >
                                Kiểm tra tài khoản Premium
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MomoResultPage;