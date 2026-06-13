import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { createSignedDownloadToken } from '../utils/signedDownload.js';

function getLogoPath() {
  const candidates = [
    process.env.WEBLIX_LOGO_PATH,
    path.resolve(process.cwd(), '../client/src/assets/weblix-logo.png'),
    path.resolve(process.cwd(), 'client/src/assets/weblix-logo.png')
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function formatDate(date) {
  if (!date) return 'No expiry';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function licenseLabel(order) {
  if (order.licenseType === 'lifetime') return 'Lifetime access';
  if (order.licenseType === 'yearly') return order.autoRenew ? 'Yearly auto-renew license' : 'Yearly license';
  return 'Standard license';
}

function purchaseHtml({ order, user, downloadUrl, dashboardUrl, logoCid }) {
  const item = order.item || {};
  const isRenewal = Boolean(order.purchaseEmailSentAt);
  return `
    <div style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,Arial,sans-serif;color:#ffffff;">
      <div style="max-width:680px;margin:0 auto;padding:34px 18px;">
        <div style="border:1px solid rgba(255,255,255,.1);border-radius:24px;background:#161616;overflow:hidden;">
          <div style="padding:30px;background:linear-gradient(135deg,#06134A,#2155FF);">
            ${logoCid ? `<img src="cid:${logoCid}" alt="Weblix Website Builder" style="display:block;max-width:220px;height:auto;margin-bottom:28px;" />` : '<h1 style="margin:0 0 28px;font-size:28px;">Weblix Website Builder</h1>'}
            <p style="margin:0;color:#dbe5ff;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${isRenewal ? 'License renewed' : 'Payment successful'}</p>
            <h2 style="margin:12px 0 0;font-size:34px;line-height:1.15;font-weight:700;">Your Weblix license is ready.</h2>
          </div>
          <div style="padding:30px;">
            <p style="margin:0 0 20px;color:#d6d6d6;font-size:16px;line-height:1.7;">Hi ${user?.name || 'there'}, thank you for choosing Weblix. Your purchase details, license, and secure download are below.</p>
            <div style="border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#0d0d0d;padding:20px;">
              <table style="width:100%;border-collapse:collapse;color:#ffffff;font-size:14px;">
                <tr><td style="padding:10px 0;color:#8f98ad;">Product</td><td style="padding:10px 0;text-align:right;font-weight:700;">${item.name || order.itemType}</td></tr>
                <tr><td style="padding:10px 0;color:#8f98ad;">License</td><td style="padding:10px 0;text-align:right;font-weight:700;">${licenseLabel(order)}</td></tr>
                <tr><td style="padding:10px 0;color:#8f98ad;">License key</td><td style="padding:10px 0;text-align:right;font-weight:700;color:#4F7BFF;">${order.licenseKey}</td></tr>
                <tr><td style="padding:10px 0;color:#8f98ad;">Amount</td><td style="padding:10px 0;text-align:right;font-weight:700;">$${Number(order.amount || 0).toFixed(2)} ${order.currency || 'USD'}</td></tr>
                <tr><td style="padding:10px 0;color:#8f98ad;">Starts</td><td style="padding:10px 0;text-align:right;font-weight:700;">${formatDate(order.licenseStartsAt)}</td></tr>
                <tr><td style="padding:10px 0;color:#8f98ad;">Renewal / expiry</td><td style="padding:10px 0;text-align:right;font-weight:700;">${formatDate(order.renewalDueAt || order.licenseExpiresAt)}</td></tr>
              </table>
            </div>
            <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
              <a href="${downloadUrl}" style="display:inline-block;background:#2155FF;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 20px;font-size:14px;font-weight:700;">Download ZIP</a>
              <a href="${dashboardUrl}" style="display:inline-block;background:#242424;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 20px;font-size:14px;font-weight:700;">Open Dashboard</a>
            </div>
            <p style="margin:24px 0 0;color:#8f98ad;font-size:13px;line-height:1.6;">Keep this email for your records. Your download and license information are also available anytime inside your Weblix dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function contactLeadHtml({ name, email, company, phone, interest, budget, message, logoCid }) {
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Company', company],
    ['Phone', phone],
    ['Interest', interest],
    ['Budget', budget]
  ].filter(([, value]) => value);

  return `
    <div style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,Arial,sans-serif;color:#ffffff;">
      <div style="max-width:720px;margin:0 auto;padding:34px 18px;">
        <div style="border:1px solid rgba(255,255,255,.1);border-radius:24px;background:#161616;overflow:hidden;">
          <div style="padding:30px;background:linear-gradient(135deg,#06134A,#2155FF);">
            ${logoCid ? `<img src="cid:${logoCid}" alt="Weblix Website Builder" style="display:block;max-width:220px;height:auto;margin-bottom:28px;" />` : '<h1 style="margin:0 0 28px;font-size:28px;">Weblix Website Builder</h1>'}
            <p style="margin:0;color:#dbe5ff;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">New website lead</p>
            <h2 style="margin:12px 0 0;font-size:34px;line-height:1.15;font-weight:700;">A visitor submitted the Weblix contact form.</h2>
          </div>
          <div style="padding:30px;">
            <div style="border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#0d0d0d;padding:20px;">
              <table style="width:100%;border-collapse:collapse;color:#ffffff;font-size:14px;">
                ${rows.map(([label, value]) => `<tr><td style="padding:10px 0;color:#8f98ad;">${escapeHtml(label)}</td><td style="padding:10px 0;text-align:right;font-weight:700;">${escapeHtml(value)}</td></tr>`).join('')}
              </table>
            </div>
            <div style="margin-top:22px;border:1px solid rgba(79,123,255,.3);border-radius:18px;background:rgba(33,85,255,.1);padding:20px;">
              <p style="margin:0 0 10px;color:#8f98ad;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Message</p>
              <p style="margin:0;color:#ffffff;font-size:16px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function otpHtml({ user, otp, logoCid, purpose = 'signup' }) {
  const isLogin = purpose === 'login';
  return `
    <div style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,Arial,sans-serif;color:#ffffff;">
      <div style="max-width:640px;margin:0 auto;padding:34px 18px;">
        <div style="border:1px solid rgba(255,255,255,.1);border-radius:24px;background:#161616;overflow:hidden;">
          <div style="padding:30px;background:linear-gradient(135deg,#06134A,#2155FF);">
            ${logoCid ? `<img src="cid:${logoCid}" alt="Weblix Website Builder" style="display:block;max-width:220px;height:auto;margin-bottom:28px;" />` : '<h1 style="margin:0 0 28px;font-size:28px;">Weblix Website Builder</h1>'}
            <p style="margin:0;color:#dbe5ff;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${isLogin ? 'Two-step verification' : 'Verify your email'}</p>
            <h2 style="margin:12px 0 0;font-size:34px;line-height:1.15;font-weight:700;">${isLogin ? 'Confirm your Weblix sign in' : 'Your Weblix verification code'}</h2>
          </div>
          <div style="padding:30px;">
            <p style="margin:0 0 18px;color:#d6d6d6;font-size:16px;line-height:1.7;">Hi ${escapeHtml(user?.name || 'there')}, enter this code to ${isLogin ? 'finish signing in to your Weblix account' : 'finish creating your Weblix account'}.</p>
            <div style="border:1px solid rgba(79,123,255,.35);border-radius:18px;background:#0d0d0d;padding:24px;text-align:center;">
              <p style="margin:0;color:#8f98ad;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Verification code</p>
              <p style="margin:14px 0 0;color:#4F7BFF;font-size:42px;line-height:1;font-weight:800;letter-spacing:.18em;">${otp}</p>
            </div>
            <p style="margin:22px 0 0;color:#8f98ad;font-size:13px;line-height:1.6;">This code expires in 10 minutes. If you did not request this, change your password and contact Weblix support.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendLicenseEmail({ order, user, download }) {
  const transport = getTransport();
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;
  const apiBase = process.env.API_PUBLIC_URL || 'http://localhost:5000';
  const token = createSignedDownloadToken(download, order);
  const downloadUrl = `${apiBase}/api/downloads/email/${download._id}/${token}`;
  const logoPath = getLogoPath();
  const logoCid = logoPath ? 'weblix-logo@license-email' : null;
  const subject = order.purchaseEmailSentAt
    ? `Your Weblix license renewed: ${order.item?.name || 'Weblix'}`
    : `Your Weblix license is ready: ${order.item?.name || 'Weblix'}`;

  if (!transport) {
    console.log('[email:dev]', {
      to: user?.email,
      subject,
      licenseKey: order.licenseKey,
      downloadUrl,
      dashboardUrl
    });
    return { skipped: true, reason: 'SMTP is not configured' };
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || `"Weblix Website Builder" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject,
    html: purchaseHtml({ order, user, downloadUrl, dashboardUrl, logoCid }),
    attachments: logoPath ? [{ filename: 'weblix-logo.png', path: logoPath, cid: logoCid }] : []
  });
}

export async function sendContactLeadEmail(lead) {
  const transport = getTransport();
  const logoPath = getLogoPath();
  const logoCid = logoPath ? 'weblix-logo@contact-lead' : null;
  const to = process.env.LEAD_TO_EMAIL || 'mandanyadav900@gmail.com';
  const subject = `New Weblix lead: ${lead.name || lead.email}`;

  if (!transport) {
    console.log('[contact-lead:dev]', { to, subject, ...lead });
    return { skipped: true, reason: 'SMTP is not configured' };
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || `"Weblix Website Builder" <${process.env.SMTP_USER}>`,
    to,
    replyTo: lead.email,
    subject,
    html: contactLeadHtml({ ...lead, logoCid }),
    attachments: logoPath ? [{ filename: 'weblix-logo.png', path: logoPath, cid: logoCid }] : []
  });
}

export async function sendSignupOtpEmail({ user, otp }) {
  const transport = getTransport();
  const logoPath = getLogoPath();
  const logoCid = logoPath ? 'weblix-logo@signup-otp' : null;
  const subject = 'Verify your Weblix account';

  if (!transport) {
    console.log('[signup-otp:dev]', { to: user.email, subject, otp });
    return { skipped: true, reason: 'SMTP is not configured', otp };
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || `"Weblix Website Builder" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject,
    html: otpHtml({ user, otp, logoCid }),
    attachments: logoPath ? [{ filename: 'weblix-logo.png', path: logoPath, cid: logoCid }] : []
  });
}

function leadOutreachHtml({ lead, trackingPixelUrl, clickUrl, logoCid }) {
  const audit = lead.websiteAudit || {};
  const issues = audit.priorityIssues?.length ? audit.priorityIssues : lead.painPoints || [];
  return `
    <div style="margin:0;padding:0;background:#f4f7ff;font-family:Inter,Arial,sans-serif;color:#0A0F2C;">
      <div style="max-width:720px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border:1px solid #dce4ff;border-radius:22px;overflow:hidden;">
          <div style="padding:28px;background:linear-gradient(135deg,#06134A,#2155FF);color:#ffffff;">
            ${logoCid ? `<img src="cid:${logoCid}" alt="Weblix" style="display:block;max-width:190px;height:auto;margin-bottom:22px;" />` : '<h1 style="margin:0 0 22px;font-size:26px;">Weblix Website Builder</h1>'}
            <p style="margin:0;color:#dbe5ff;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Website growth audit</p>
            <h2 style="margin:10px 0 0;font-size:30px;line-height:1.2;">Quick improvement ideas for ${escapeHtml(lead.businessName)}</h2>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Hi ${escapeHtml(lead.businessName)} team,</p>
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">I reviewed your website and local presence and found a few practical opportunities that could help you generate more calls, quote requests, and booked appointments.</p>
            <div style="border:1px solid #e6ecff;border-radius:16px;background:#f8faff;padding:18px;margin:18px 0;">
              <p style="margin:0 0 10px;font-weight:800;color:#2155FF;">Top findings</p>
              <ul style="margin:0;padding-left:20px;color:#38415f;line-height:1.7;">
                ${issues.slice(0, 5).map((issue) => `<li>${escapeHtml(issue)}</li>`).join('')}
              </ul>
            </div>
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">I attached a short PDF audit with scores for SEO, speed, mobile, trust signals and conversion opportunities.</p>
            <a href="${clickUrl}" style="display:inline-block;background:#2155FF;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 20px;font-size:14px;font-weight:800;">View Weblix Website Solutions</a>
            <p style="font-size:13px;line-height:1.6;color:#68718c;margin:22px 0 0;">If you want, I can also send a simple redesign and local SEO action plan for your business category.</p>
          </div>
        </div>
      </div>
      <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
    </div>
  `;
}

export async function sendLeadAuditEmail({ lead, pdfBuffer }) {
  const transport = getTransport();
  if (!lead.email) return { skipped: true, reason: 'Lead has no email address' };

  const apiBase = process.env.API_PUBLIC_URL || 'http://localhost:5000';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const trackingPixelUrl = `${apiBase}/api/leads/track/open/${lead._id}.png`;
  const clickUrl = `${apiBase}/api/leads/track/click/${lead._id}?url=${encodeURIComponent(`${clientUrl}/pricing`)}`;
  const logoPath = getLogoPath();
  const logoCid = logoPath ? 'weblix-logo@lead-audit' : null;
  const subject = lead.outreachEmailSubject || `Website audit ideas for ${lead.businessName}`;

  if (!transport) {
    console.log('[lead-audit-email:dev]', { to: lead.email, subject, trackingPixelUrl, clickUrl });
    return { skipped: true, reason: 'SMTP is not configured' };
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || `"Weblix Website Builder" <${process.env.SMTP_USER}>`,
    to: lead.email,
    subject,
    text: lead.outreachEmailBody,
    html: leadOutreachHtml({ lead, trackingPixelUrl, clickUrl, logoCid }),
    attachments: [
      ...(logoPath ? [{ filename: 'weblix-logo.png', path: logoPath, cid: logoCid }] : []),
      { filename: `${String(lead.businessName || 'website-audit').replace(/[^a-z0-9-]+/gi, '-')}-audit.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
    ]
  });
}

export async function sendLoginOtpEmail({ user, otp }) {
  const transport = getTransport();
  const logoPath = getLogoPath();
  const logoCid = logoPath ? 'weblix-logo@login-otp' : null;
  const subject = 'Your Weblix sign-in verification code';

  if (!transport) {
    console.log('[login-otp:dev]', { to: user.email, subject, otp });
    return { skipped: true, reason: 'SMTP is not configured', otp };
  }

  return transport.sendMail({
    from: process.env.MAIL_FROM || `"Weblix Website Builder" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject,
    html: otpHtml({ user, otp, logoCid, purpose: 'login' }),
    attachments: logoPath ? [{ filename: 'weblix-logo.png', path: logoPath, cid: logoCid }] : []
  });
}
