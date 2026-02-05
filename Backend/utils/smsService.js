// utils/smsService.js
const axios = require('axios');
const crypto = require('crypto');
const { SmsLog } = require('../models');

const sendSmsV2 = async (to, content, purpose) => {
  const date = Date.now().toString();
  const serviceId = 'ncp:sms:kr:366085518677:absoltech';
  const accessKey = process.env.NCP_ACCESS_KEY;
  const secretKey = process.env.NCP_SECRET_KEY;
  const from = process.env.SENDER_NUMBER; // 등록된 발신번호

  const url = `/sms/v2/services/${serviceId}/messages`;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(`POST ${url}\n${date}\n${accessKey}`)
    .digest('base64');

  // 한글 45자 초과 시 자동 LMS 전환
  const type = Buffer.byteLength(content, 'euc-kr') > 90 ? 'LMS' : 'SMS';

  try {
    const res = await axios.post(`https://sens.apigw.ntruss.com${url}`, {
      type, from, content,
      messages: [{ to: to.replace(/-/g, '') }]
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': date,
        'x-ncp-apigw-signature-v2': signature
      }
    });

    // 로그 저장
    await SmsLog.create({
      receiver: to, content, purpose,
      status: 'success', msg_type: type, request_id: res.data.requestId
    });
    return res.data;
  } catch (err) {
    await SmsLog.create({ receiver: to, content, purpose, status: 'fail' });
    throw err;
  }
};

module.exports = { sendSmsV2 };