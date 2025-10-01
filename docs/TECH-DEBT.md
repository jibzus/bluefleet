# BlueFleet - Technical Debt & Future Improvements

**Last Updated**: 2025-09-30  
**Status**: Active tracking

---

## Critical Issues

### 1. Vessel Detail Page Syntax Error
**Location**: `app/vessel/[slug]/page.tsx`  
**Issue**: Next.js compilation error - "Unexpected token `main`"  
**Impact**: Vessel detail pages may not render correctly  
**Priority**: HIGH  
**Effort**: 30 minutes  
**Fix**: Likely a caching issue, may need to restart dev server or clear `.next` cache

---

## High Priority Tech Debt

### 2. File Upload Not Implemented
**Location**: `components/vessel/MediaTab.tsx`, `components/kyc/*`  
**Issue**: Currently using URL input instead of actual file upload  
**Impact**: Poor UX, users can't upload files directly  
**Priority**: HIGH  
**Effort**: 4-6 hours  
**Solution**: Implement Vercel Blob or AWS S3 integration with file upload component

### 3. Image Optimization Missing
**Location**: All image displays  
**Issue**: Using `<img>` instead of Next.js `<Image>` component  
**Impact**: Poor performance, no automatic optimization  
**Priority**: HIGH  
**Effort**: 2-3 hours  
**Solution**: Replace all `<img>` tags with Next.js `Image` component, configure image domains

### 4. No Pagination on Search Results
**Location**: `components/search/SearchResults.tsx`  
**Issue**: All results loaded at once  
**Impact**: Performance degrades with many vessels  
**Priority**: HIGH  
**Effort**: 3-4 hours  
**Solution**: Implement cursor-based pagination with 20 results per page

### 5. Client-Side Filtering for JSON Fields
**Location**: `components/search/SearchResults.tsx`  
**Issue**: Pricing, emissions, year filters done client-side  
**Impact**: Not scalable, inefficient for large datasets  
**Priority**: HIGH  
**Effort**: 6-8 hours  
**Solution**: Restructure schema to have dedicated columns for searchable fields, or use Postgres JSON operators

---

## Medium Priority Tech Debt

### 6. No Full-Text Search
**Location**: `components/search/SearchResults.tsx`  
**Issue**: Using simple LIKE queries instead of Postgres full-text search  
**Impact**: Poor search quality, no relevance ranking  
**Priority**: MEDIUM  
**Effort**: 4-6 hours  
**Solution**: Implement Postgres `tsvector` and trigram indexes

### 7. Mobile Filter Drawer Missing
**Location**: `app/search/page.tsx`  
**Issue**: Filter sidebar hidden on mobile (lg:block)  
**Impact**: Mobile users can't filter results  
**Priority**: MEDIUM  
**Effort**: 2-3 hours  
**Solution**: Implement shadcn Sheet/Drawer component for mobile filters

### 8. No Error Boundaries
**Location**: All pages  
**Issue**: No error boundaries to catch runtime errors  
**Impact**: Poor error handling, crashes show default error page  
**Priority**: MEDIUM  
**Effort**: 2-3 hours  
**Solution**: Add error.tsx files to key routes

### 9. No Loading States
**Location**: Most pages  
**Issue**: Limited loading indicators and skeleton screens  
**Impact**: Poor perceived performance  
**Priority**: MEDIUM  
**Effort**: 3-4 hours  
**Solution**: Add loading.tsx files and skeleton components

### 10. Placeholder Images Return 404
**Location**: All vessel cards  
**Issue**: `/placeholder-vessel.jpg` doesn't exist  
**Impact**: Broken image icons for vessels without images  
**Priority**: MEDIUM  
**Effort**: 30 minutes  
**Solution**: Add placeholder image to `public/` directory or use data URI

### 11. No Email Notifications
**Location**: KYC approval/rejection, compliance verification  
**Issue**: Users not notified of status changes  
**Impact**: Poor UX, users must manually check status  
**Priority**: MEDIUM  
**Effort**: 4-6 hours  
**Solution**: Integrate email service (Resend, SendGrid) and create email templates

### 12. No Audit Logging
**Location**: All admin actions
**Issue**: No comprehensive audit trail for admin actions
**Impact**: Compliance risk, can't track who did what
**Priority**: MEDIUM
**Effort**: 3-4 hours
**Solution**: Create AuditLog model and log all sensitive operations

### 13. No Counter Offer UI (WP-5)
**Location**: `components/booking/BookingActions.tsx`, owner booking detail pages
**Issue**: Counter offer API exists but no UI for owners to propose changes
**Impact**: Owners cannot negotiate terms, must accept or reject
**Priority**: MEDIUM
**Effort**: 4-6 hours
**Solution**: Create CounterOfferDialog component with date/pricing/terms modification

### 14. No Booking Email Notifications (WP-5)
**Location**: `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`
**Issue**: No email notifications for booking status changes
**Impact**: Users must manually check for updates
**Priority**: MEDIUM
**Effort**: 3-4 hours
**Solution**: Integrate email service (Resend/SendGrid) and send notifications on status changes

### 15. No Booking Modification (WP-5)
**Location**: Booking detail pages
**Issue**: Cannot modify booking dates or terms after creation
**Impact**: Users must cancel and recreate bookings for changes
**Priority**: MEDIUM
**Effort**: 4-5 hours
**Solution**: Add modification workflow with owner approval for changes

### 16. No Cancellation Policy (WP-5)
**Location**: Booking cancellation logic
**Issue**: No cancellation fees, deadlines, or refund policies
**Impact**: No protection for owners from last-minute cancellations
**Priority**: MEDIUM
**Effort**: 3-4 hours
**Solution**: Implement configurable cancellation policy with fee calculation

### 17. No Actual Payment Provider Integration (WP-6)
**Location**: `app/api/escrow/route.ts`, payment initialization
**Issue**: Mock payment URLs instead of actual Paystack/Flutterwave API calls
**Impact**: Cannot process real payments in production
**Priority**: HIGH
**Effort**: 4-6 hours
**Solution**: Integrate Paystack API (`/transaction/initialize`) and Flutterwave API with proper error handling

### 18. No Blob Storage for PDFs (WP-6)
**Location**: `lib/pdf.ts`, `savePDF()` function
**Issue**: PDFs not stored in cloud storage, using mock URLs
**Impact**: Cannot serve or download actual contract PDFs
**Priority**: HIGH
**Effort**: 3-4 hours
**Solution**: Integrate Vercel Blob or AWS S3 for PDF storage with signed URLs

### 19. No Email Notifications for Contracts/Payments (WP-6)
**Location**: Contract generation, signature, payment events
**Issue**: Users not notified of contract readiness, signatures, or payment status
**Impact**: Poor user experience, users must manually check for updates
**Priority**: MEDIUM
**Effort**: 4-5 hours
**Solution**: Integrate email service (Resend/SendGrid) for contract and payment notifications

### 20. No Automated Payout (WP-6)
**Location**: `app/api/escrow/[id]/release/route.ts`
**Issue**: Escrow release doesn't trigger actual payout to owner
**Impact**: Manual payout required, delays owner payment
**Priority**: HIGH
**Effort**: 5-6 hours
**Solution**: Integrate Paystack Transfer API or Flutterwave Payout API for automated disbursements

---

## Low Priority Tech Debt

### 13. No Input Validation on Client
**Location**: All forms  
**Issue**: Validation only on server, no client-side feedback  
**Impact**: Poor UX, users see errors after submission  
**Priority**: LOW  
**Effort**: 4-6 hours  
**Solution**: Add react-hook-form with Zod resolver for client-side validation

### 14. No Rate Limiting
**Location**: All API routes  
**Issue**: No protection against abuse  
**Impact**: Security risk, potential DoS  
**Priority**: LOW  
**Effort**: 2-3 hours  
**Solution**: Implement rate limiting middleware (upstash/ratelimit)

### 15. No Caching Strategy
**Location**: All data fetching  
**Issue**: No caching of frequently accessed data  
**Impact**: Unnecessary database queries  
**Priority**: LOW  
**Effort**: 3-4 hours  
**Solution**: Implement Redis caching for vessel listings, user sessions

### 16. No Database Indexes
**Location**: Prisma schema  
**Issue**: Missing indexes on frequently queried fields  
**Impact**: Slow queries as data grows  
**Priority**: LOW  
**Effort**: 1-2 hours  
**Solution**: Add indexes on `type`, `homePort`, `status`, `createdAt`

### 17. No API Documentation
**Location**: All API routes  
**Issue**: No OpenAPI/Swagger documentation  
**Impact**: Hard for frontend devs to use APIs  
**Priority**: LOW  
**Effort**: 4-6 hours  
**Solution**: Generate OpenAPI spec from route handlers

### 18. No E2E Tests
**Location**: All features  
**Issue**: Only manual testing, no automated E2E tests  
**Impact**: Regression risk  
**Priority**: LOW  
**Effort**: 8-12 hours  
**Solution**: Implement Playwright tests for critical flows

### 19. No Monitoring/Observability
**Location**: Production deployment  
**Issue**: No error tracking, performance monitoring  
**Impact**: Can't diagnose production issues  
**Priority**: LOW  
**Effort**: 2-3 hours  
**Solution**: Integrate Sentry for error tracking, Vercel Analytics for performance

### 20. Hard-Coded Credentials in Seed Script
**Location**: `scripts/seed.ts`  
**Issue**: Password "password123" hard-coded  
**Impact**: Security risk if seed script runs in production  
**Priority**: LOW  
**Effort**: 30 minutes  
**Solution**: Use environment variables or generate random passwords

---

## Feature Gaps (Not Tech Debt)

### WP-3: Vessel CRUD
- [ ] Bulk availability update
- [ ] CSV export
- [ ] Performance analytics dashboard
- [ ] Vessel cloning
- [ ] Drag-and-drop image upload

### WP-4: Search & Filters
- [ ] Saved searches
- [ ] Search history
- [ ] Map view with geographic search
- [ ] Search suggestions/autocomplete
- [ ] Vessel comparison tool
- [ ] Recently viewed vessels

### WP-5: Booking Request
- [ ] Counter offer UI (API exists but no frontend)
- [ ] Email notifications for booking status changes
- [ ] Negotiation thread/messaging system
- [ ] Booking modification (change dates after creation)
- [ ] Cancellation policy and fees implementation
- [ ] Booking conflicts resolution workflow
- [ ] Calendar view for bookings
- [ ] Booking templates for repeat customers
- [ ] Bulk booking for multiple vessels

### WP-6: Escrow & Payments
- [ ] Actual Paystack API integration (currently mock URLs)
- [ ] Actual Flutterwave API integration (currently mock URLs)
- [ ] Vercel Blob/S3 storage for PDFs and signatures
- [ ] Email notifications for contract/payment events
- [ ] Signature image storage and display
- [ ] Automated payout to owners after escrow release
- [ ] Payment receipt generation
- [ ] Dispute resolution workflow
- [ ] Refund processing
- [ ] Payment retry logic for failed transactions
- [ ] Installment payment option
- [ ] Payment analytics dashboard

### WP-7: Tracking & Operations
- [ ] Actual MarineTraffic API integration (currently mock)
- [ ] Actual exactEarth API integration (currently mock)
- [ ] Offline cache with service workers
- [ ] Incident notes and status updates UI
- [ ] Geofencing with alerts for designated areas
- [ ] ETA calculations based on route and speed
- [ ] Weather data overlay (OpenWeatherMap integration)
- [ ] Port detection (arrival/departure automation)
- [ ] Route optimization suggestions
- [ ] Tracking analytics dashboard
- [ ] Export tracking data (CSV/KML)
- [ ] Share tracking link with third parties
- [ ] Historical route playback
- [ ] Speed/course anomaly detection
- [ ] Fuel consumption estimates

### WP-8: Analytics & Pricing
- [ ] Analytics dashboard UI with charts (Recharts)
- [ ] Historical trend analysis (year-over-year)
- [ ] Caching for expensive calculations (Redis)
- [ ] Export functionality (CSV/PDF reports)
- [ ] Pricing recommendation acceptance workflow
- [ ] ML-based pricing (TensorFlow.js)
- [ ] Forecasting and predictions
- [ ] External market data integration
- [ ] Custom report builder
- [ ] Real-time analytics updates
- [ ] A/B testing for pricing strategies
- [ ] Anomaly detection
- [ ] Competitor price tracking
- [ ] Analytics API for third-party integrations

### WP-9: Compliance
- [ ] Email notifications for expiry alerts
- [ ] CSV/PDF export
- [ ] Advanced filtering (date range, search)
- [ ] Compliance analytics and trends
- [ ] API integration with NIMASA/NIPEX

### WP-10: Admin Console
- [ ] Move settings to database (PlatformSettings model)
- [ ] Implement audit logging for all admin actions
- [ ] Add user suspension/ban functionality
- [ ] Add bulk user operations
- [ ] Implement advanced search and filtering
- [ ] Add data export functionality (CSV/Excel)
- [ ] Implement email notifications for admin actions
- [ ] Add system health monitoring
- [ ] Create performance metrics dashboard
- [ ] Add detailed activity logs
- [ ] Implement role permissions management
- [ ] Add custom admin roles
- [ ] Add scheduled tasks management
- [ ] Create admin API for third-party integrations

### General
- [ ] 2FA for admin users
- [ ] PWA support for offline access
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Refactoring Opportunities

### 1. Extract Reusable Components
**Issue**: Repeated code in form components  
**Solution**: Create shared form field components (TextField, SelectField, DateField)

### 2. Centralize API Error Handling
**Issue**: Error handling duplicated in every API route  
**Solution**: Create error handling middleware/wrapper

### 3. Type Safety for JSON Fields
**Issue**: Using `any` for vessel.specs, emissions, pricing  
**Solution**: Create proper TypeScript interfaces and use type assertions

### 4. Consolidate Validation Schemas
**Issue**: Validation logic scattered across files  
**Solution**: Centralize all Zod schemas in `lib/validators/`

### 5. Extract Business Logic from Components
**Issue**: Business logic mixed with UI components  
**Solution**: Create service layer (`lib/services/`) for business logic

---

## Performance Optimizations

### Database
- [ ] Add indexes on frequently queried fields
- [ ] Implement connection pooling
- [ ] Use database views for complex queries
- [ ] Implement read replicas for scaling

### Frontend
- [ ] Code splitting for large components
- [ ] Lazy loading for images
- [ ] Prefetching for common navigation paths
- [ ] Service worker for offline support

### API
- [ ] Implement response caching
- [ ] Use Edge runtime where possible
- [ ] Optimize JSON payload sizes
- [ ] Implement GraphQL for flexible queries

---

## Security Improvements

### Authentication
- [ ] Implement 2FA
- [ ] Add session timeout
- [ ] Implement password reset flow
- [ ] Add account lockout after failed attempts

### Authorization
- [ ] Implement row-level security
- [ ] Add API key authentication for external integrations
- [ ] Implement CSRF protection
- [ ] Add content security policy headers

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Implement data retention policies
- [ ] Add GDPR compliance features (data export, deletion)
- [ ] Implement audit logging for all data access

---

## Deployment & DevOps

### CI/CD
- [ ] Set up GitHub Actions for automated testing
- [ ] Implement automated deployments
- [ ] Add preview deployments for PRs
- [ ] Implement database migration strategy

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Implement performance monitoring
- [ ] Add uptime monitoring
- [ ] Create alerting for critical errors

### Infrastructure
- [ ] Set up staging environment
- [ ] Implement database backups
- [ ] Add CDN for static assets
- [ ] Implement disaster recovery plan

---

## Documentation Gaps

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component documentation (Storybook)
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Architecture decision records (ADRs)
- [ ] Runbook for common operations

---

## Prioritization Matrix

**Critical (Do Now):**
1. Fix vessel detail page syntax error

**High Priority (This Sprint):**
2. Implement file upload
3. Add image optimization
4. Add pagination to search
5. Move JSON field filtering to database

**Medium Priority (Next Sprint):**
6. Implement full-text search
7. Add mobile filter drawer
8. Add error boundaries
9. Add loading states
10. Fix placeholder images
11. Implement email notifications

**Low Priority (Backlog):**
- Everything else

---

## Tracking

**Total Items**: 28 tech debt items + 79+ feature gaps
**Critical**: 1
**High**: 13 (added settings database, audit logging)
**Medium**: 13
**Low**: 7

**Estimated Total Effort**: 200-280 hours

### By Work Package

**WP-1 (Auth & RBAC)**: 1 item (2FA)
**WP-2 (KYC/KYB)**: 3 items (blob storage, email, audit trail)
**WP-3 (Vessel CRUD)**: 4 items (file upload, image optimization, pagination, JSON filtering)
**WP-4 (Search & Filters)**: 3 items (pagination, mobile filters, full-text search)
**WP-5 (Booking Request)**: 9 items (counter offer UI, emails, negotiation, modification, cancellation policy)
**WP-6 (Escrow & Payments)**: 12 items (payment APIs, blob storage, emails, payout, dispute resolution)
**WP-7 (Tracking & Operations)**: 15 items (AIS API integration, offline cache, incident notes, geofencing, ETA, weather, port detection, etc.)
**WP-8 (Analytics & Pricing)**: 14 items (dashboard UI, ML pricing, forecasting, caching, export, real-time updates, etc.)
**WP-9 (Compliance)**: 5 items (email alerts, export, filtering, analytics, API integration)
**WP-10 (Admin Console)**: 14 items (settings database, audit logging, user suspension, bulk operations, health monitoring, etc.)
**General**: 5 items (2FA, PWA, dark mode, i18n, accessibility audit)

---

## Notes

- This document should be reviewed and updated after each work package
- New tech debt should be added as it's identified
- Completed items should be moved to a "Resolved" section with completion date
- Priority should be reassessed regularly based on business needs

