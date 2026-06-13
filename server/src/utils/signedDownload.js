import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.JWT_SECRET || 'weblix-dev-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSignedDownloadToken(download, order) {
  const payload = Buffer.from(JSON.stringify({
    downloadId: download._id.toString(),
    orderId: order._id.toString(),
    exp: Date.now() + TOKEN_TTL_MS
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySignedDownloadToken(token, downloadId) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature || sign(payload) !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.downloadId === downloadId && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}
