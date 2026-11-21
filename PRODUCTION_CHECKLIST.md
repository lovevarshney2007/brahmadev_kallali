# 🚀 Production Deployment Checklist

**Website:** Shri Kshetra Brahmadev Devasthan, Kallali  
**Date:** 2026-11-21

---

## ✅ Completed (Local)

- [x] Security enhancements implemented
- [x] Password complexity policy (12+ chars, mixed case, number, special char)
- [x] Enhanced CSP headers (`object-src: none`, `frame-ancestors: none`)
- [x] Additional security headers (XSS Filter, nosniff, frameguard, dnsPrefetch)
- [x] Improved rate limiting with custom error messages
- [x] Enhanced health check (`/api/health` now shows DB status)
- [x] Graceful shutdown handlers (SIGTERM, SIGINT, unhandledRejection, uncaughtException)
- [x] JWT secret rotated (`a03fa0d283c6f1e74214985530eb718e00dcb3ee935f9f943bcb4383d463f6d88bd8a77c68436b51cc2a02009c632e71`)
- [x] Client build completed (`npm run build --prefix client`)
- [x] All tests passed:
  - Server startup ✅
  - Health check ✅
  - Settings endpoint ✅
  - Login flow ✅
  - Authenticated routes ✅
  - Graceful shutdown ✅

---

## 🔄 Next Steps for Production

### 1. Environment Variables (Hosting Dashboard)
Set these in your hosting platform (Render/Railway/Vercel):

```env
# Required for production
NODE_ENV=production
PORT=5000  # or use platform default
CLIENT_URL=https://shribrahmadevadevasthan.org
CLIENT_ORIGINS=https://www.shribrahmadevadevasthan.org

# Database (use production MongoDB)
MONGODB_URI=mongodb+srv://your_prod_user:your_prod_password@your_cluster.mongodb.net/brahmadev_kallali

# Security secrets (all should be NEW values)
JWT_SECRET=<GENERATE_NEW_64_CHAR_HEX_STRING>
RAZORPAY_KEY_SECRET=<WHEN_READY_FOR_PAYMENTS>

# Admin (change after first login)
ADMIN_DEFAULT_PASSWORD=<STRONG_NEW_PASSWORD>
```

### 2. Razorpay Live Keys (Optional - Payment Not Ready)
When ready for live payments:

1. Go to Razorpay Dashboard → Settings → API Keys
2. Create/get Live API Key ID
3. Update webhook URL to point to production
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### 3. DNS & HTTPS
- [ ] Configure domain (`shribrahmadevadevasthan.org`)
- [ ] SSL certificate (auto-provided by Vercel/Render)
- [ ] CDN configuration (Cloudinary handles images)

### 4. Post-Deployment Tasks
- [ ] Test login with admin credentials
- [ ] Force admin to change password
- [ ] Test donation flow (UPI QR first, then online payments)
- [ ] Verify photo upload works
- [ ] Monitor logs for errors

---

## 📊 Performance Metrics (Current)

| Metric | Value | Status |
|--------|-------|--------|
| Health Check | `/api/health` | ✅ DB status included |
| API Response Time | ~500ms avg | ✅ Good |
| Rate Limit | 300 req/min/IP | ✅ Configured |
| Image Optimization | Cloudinary auto | ✅ 1600px limit |
| Client Bundle | 81.74KB gzipped | ✅ Optimized |

---

## 🛡️ Security Notes

### Current Protection Layers
1. **Authentication**: JWT + HTTP-only cookies + bcrypt
2. **CORS**: Strict origin allowlist
3. **Helmet**: CSP + XSS Filter + nosniff + frameguard
4. **Rate Limiting**: 300 req/min per IP, per-route limits
5. **Input Validation**: Zod schemas on all endpoints

### Password Policy
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special character
- Hashed with bcrypt (12 rounds)

---

## 📞 Support Contact

**Temple Trustee:** Maruti kunjatwad  
**Phone:** 9503131031  
**Admin Email:** admin@brahmadev.org

---

## 📦 Files Modified

1. `server/src/app.js` - Security headers, rate limiter, health check
2. `server/src/index.js` - Graceful shutdown handlers
3. `server/src/models/Admin.js` - Password validation export
4. `server/src/routes/auth.js` - Password complexity enforcement
5. `server/.env` - JWT secret rotated

---

*Ready for production deployment after environment variable setup.*