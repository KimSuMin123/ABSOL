const axios = require('axios');
const crypto = require('crypto');
const { SmsLog } = require('../models');

const sendSmsV2 = async (to, content, purpose) => {
  const date = Date.now().toString();
  const serviceId = 'ncp:sms:kr:366085518677:absoltech';
  const accessKey = process.env.NCP_ACCESS_KEY;
  const secretKey = process.env.NCP_SECRET_KEY;
  const from = process.env.SENDER_NUMBER;

  if (!accessKey || !secretKey) {
    throw new Error('NCP API 키 설정이 누락되었습니다.');
  }

  const method = "POST";
  const url = `/sms/v2/services/${serviceId}/messages`;
  const space = " ";
  const newLine = "\n";

  // Signature 생성 (형식 정밀 수정)
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(method + space + url + newLine + date + newLine + accessKey);
  const signature = hmac.digest('base64');

  const type = Buffer.byteLength(content, 'euc-kr') > 90 ? 'LMS' : 'SMS';

  try {
    const res = await axios.post(`https://sens.apigw.ntruss.com${url}`, {
      type,
      contentType: "COMM",
      from,
      content,
      messages: [{ to: to.replace(/-/g, '') }]
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': date,
        'x-ncp-apigw-signature-v2': signature
      }
    });

    if (SmsLog) {
      await SmsLog.create({
        receiver: to, content, purpose,
        status: 'success', msg_type: type, request_id: res.data.requestId
      });
    }
    return res.data;
  } catch (err) {
    console.error('NCP 발송 에러 상세:', err.response?.data || err.message);
    if (SmsLog) await SmsLog.create({ receiver: to, content, purpose, status: 'fail' });
    throw err;
  }
};

module.exports = { sendSmsV2 };