const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const https = require('https');
const axios = require('axios');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//     origin: 'http://localhost:3000', // Domain của client
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
// }));

// production
app.use(
    cors({
        origin: 'http://47.130.114.110:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }),
);

app.post('/payment', (req, res) => {
    const { amount, orderIdSuffix, accountId } = req.body;

    if (!amount || !orderIdSuffix) return res.status(400).json({ message: 'Amount và orderIdSuffix là bắt buộc.' });

    // Thông tin cố định
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'Spotify Premium Max VIP Pro Plus Plus';
    var partnerCode = 'MOMO';

    var ipnUrl = 'https://fb56-116-102-185-203.ngrok-free.app/payment-result';

    var requestType = 'payWithMethod';
    var extraData = '';
    var orderId = partnerCode + orderIdSuffix;
    // var redirectUrl = 'http://localhost:3000/momo?accountId=' + accountId + '&orderId=' + orderIdSuffix;
    // production
    const redirectUrl = `http://47.130.114.110:3000/momo?accountId=${accountId}&orderId=${orderIdSuffix}`;
    var requestId = orderId;
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    // Tạo raw signature
    var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Tạo signature
    var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    // Dữ liệu JSON gửi đến MoMo
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTestStore',
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
    });

    // Tạo HTTPS request
    const https = require('https');
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
        },
    };

    // Gửi yêu cầu đến MoMo
    const paymentRequest = https.request(options, (momoResponse) => {
        let data = '';
        momoResponse.on('data', (chunk) => {
            data += chunk;
        });
        momoResponse.on('end', () => {
            res.status(200).json(JSON.parse(data)); // Gửi phản hồi về client
        });
    });

    paymentRequest.on('error', (e) => {
        res.status(500).json({ error: e.message });
    });

    paymentRequest.write(requestBody);
    paymentRequest.end();
});

// API nhận thông báo từ MoMo (IPN)
app.post('/payment-result', async (req, res) => {
    const { orderId, resultCode, message } = req.body;

    if (!orderId || resultCode === undefined) return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });

    // Kiểm tra kết quả giao dịch
    if (resultCode === 0) return res.status(200).json({ message: 'Giao dịch thành công.' });
    else return res.status(200).json({ message: 'Giao dịch thất bại.' });
});

app.post('/check-status-transaction', async (req, res) => {
    const { orderId } = req.body;

    // const signature = accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode
    // &requestId=$requestId
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var accessKey = 'F8BBA842ECF85';
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: 'MOMO',
        requestId: orderId,
        orderId: orderId,
        signature: signature,
        lang: 'vi',
    });

    // options for axios
    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/query',
        headers: {
            'Content-Type': 'application/json',
        },
        data: requestBody,
    };

    const result = await axios(options);

    return res.status(200).json(result.data);
});

app.post('/refund-payment', async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
        return res.status(400).json({ message: 'orderId và amount là bắt buộc.' });
    }

    // Thông tin cố định
    const partnerCode = 'MOMO';
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const requestId = `${partnerCode}${Date.now()}`;
    const description = 'Hoàn tiền giao dịch';

    // Tạo raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;

    // Tạo signature bằng HMAC SHA256
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    // Dữ liệu gửi tới MoMo
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        requestId: requestId,
        orderId: orderId,
        amount: amount,
        description: description,
        lang: 'vi',
        signature: signature,
    });

    try {
        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/refund', requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json(error.response.data);
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
