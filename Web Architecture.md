┌─────────────────────────────────────────────────────────────┐
│  LANDING PAGE (nextventures.in - Hostinger)                 │
│                                                             │
│  PUBLIC SECTIONS:                                           │
│  1. Contact Form → POST /api/contact                        │
│  2. Newsletter Signup → POST /api/subscribe                 │
│  3. Blog Preview (Homepage) → GET /api/blogs?limit=3        │
│  4. Case Studies Preview → GET /api/case-studies?limit=3    │
│  5. Search Box → GET /api/search?q=keyword                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS Requests (with CORS)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CMS API LAYER (cms.nextventures.in/api - Vercel)           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PUBLIC ENDPOINTS (No auth required)                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GET  /api/blogs                                     │   │
│  │       ?limit=10 &page=1 &tag=business                │   │
│  │       Returns: { blogs: [...], total, hasMore }      │   │
│  │                                                      │   │
│  │  GET  /api/blogs/:slug                               │   │
│  │       Returns: Full blog post with MDX content       │   │
│  │                                                      │   │
│  │  GET  /api/case-studies                              │   │
│  │       ?industry=tech &limit=10                       │   │
│  │       Returns: { caseStudies: [...], total }         │   │
│  │                                                      │   │
│  │  GET  /api/case-studies/:slug                        │   │
│  │       Returns: Full case study details               │   │
│  │                                                      │   │
│  │  POST /api/contact                                   │   │
│  │       Body: { name, email, phone, service, message } │   │
│  │       → Validate → Save DB → Send emails             │   │
│  │       Returns: { success: true, id }                 │   │
│  │                                                      │   │
│  │  POST /api/subscribe                                 │   │ 
│  │       Body: { email, name?, source }                 │   │
│  │       → Check duplicates → Save → Welcome email      │   │
│  │       Returns: { success: true }                     │   │
│  │                                                      │   │
│  │  GET  /api/search                                    │   │
│  │       ?q=funding&type=blog,case-study                │   │
│  │       Returns: { results: [...] }                    │   │
│  │                                                      │   │
│  │  GET  /api/tags                                      │   │
│  │       Returns: List of all tags/categories           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ADMIN ENDPOINTS (Auth required via JWT/Session)     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  POST /api/admin/auth/login                          │   │
│  │       Body: { email, password }                      │   │
│  │       → Verify via Supabase Auth                     │   │
│  │       Returns: { token, user }                       │   │
│  │                                                      │   │
│  │  POST /api/admin/auth/logout                         │   │
│  │       Invalidates session                            │   │
│  │                                                      │   │
│  │  GET  /api/admin/dashboard/stats                     │   │
│  │       Returns: { contacts: 45, subscribers: 230,     │   │
│  │                  blogViews: 1200, conversionRate }   │   │
│  │                                                      │   │
│  │  GET  /api/admin/contacts                            │   │
│  │       ?status=new&service=finance&page=1             │   │
│  │       Returns: Paginated contact list                │   │
│  │                                                      │   │ 
│  │  PATCH /api/admin/contacts/:id                       │   │
│  │       Body: { status: 'contacted' }                  │   │
│  │       Update contact status                          │   │
│  │                                                      │   │
│  │  GET  /api/admin/subscribers                         │   │
│  │       ?subscribed=true&source=contact_form           │   │
│  │       Returns: Subscriber list with segments         │   │
│  │                                                      │   │
│  │  POST /api/admin/blogs                               │   │
│  │       Body: { title, content, tags, status }         │   │
│  │       → Validate → Save draft/publish                │   │
│  │       Returns: { success: true, blog_id, slug }      │   │
│  │                                                      │   │
│  │  PUT  /api/admin/blogs/:id                           │   │
│  │       Update existing blog post                      │   │
│  │                                                      │   │
│  │  POST /api/admin/blogs/:id/publish                   │   │
│  │       → Set status=published                         │   │
│  │       → Trigger newsletter to subscribers            │   │
│  │       → Regenerate sitemap                           │   │
│  │       Returns: { success: true, sent_count }         │   │
│  │                                                      │   │
│  │  DELETE /api/admin/blogs/:id                         │   │
│  │       Soft delete (set deleted_at)                   │   │
│  │                                                      │   │
│  │  POST /api/admin/case-studies                        │   │
│  │       Create new case study                          │   │
│  │                                                      │   │
│  │  POST /api/admin/campaigns/create                    │   │
│  │       Body: { subject, content, segment, schedule }  │   │
│  │       → Save campaign draft                          │   │
│  │                                                      │   │
│  │  POST /api/admin/campaigns/:id/send                  │   │
│  │       → Fetch subscribers by segment                 │   │
│  │       → Send via Resend batch API                    │   │
│  │       → Log campaign metrics                         │   │
│  │       Returns: { sent_count, queued }                │   │
│  │                                                      │   │
│  │  GET  /api/admin/campaigns/:id/analytics             │   │
│  │       Returns: { opens, clicks, bounces,             |   |
|  |        unsubscribes}                                 │   │
│  │                                                      │   │
│  │  POST /api/admin/media/upload                        │   │
│  │       Multipart form data (image/file)               │   │
│  │       → Upload to Supabase Storage                   │   │
│  │       → Optimize image (resize, compress)            │   │
│  │       Returns: { url, filename }                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WEBHOOK ENDPOINTS (For integrations)                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  POST /api/webhooks/resend                           │   │
│  │       Receives email events (opened, clicked, etc.)  │   │
│  │       → Update analytics in database                 │   │
│  │                                                      │   │
│  │  POST /api/webhooks/payment (Future)                 │   │
│  │       For consultation bookings payment confirmation │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE (Database + Storage + Auth)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TABLES                                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  contacts                                            │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - name (text, not null)                           │   │
│  │    - email (text, unique, indexed)                   │   │
│  │    - phone (text, not null)                          │   │
│  │    - organization (text, nullable)                   │   │
│  │    - service_interest (enum)                         │   │
│  │    - message (text)                                  │   │
│  │    - subscribed (boolean, default true)              │   │
│  │    - status (enum: new, contacted, qualified, lost)  │   │
│  │    - source (text: 'website_contact_form')           │   │
│  │    - created_at (timestamp, indexed)                 │   │
│  │    - updated_at (timestamp)                          │   │
│  │    - assigned_to (uuid, FK to staff_users)           │   │
│  │                                                      │   │
│  │  subscribers                                         │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - email (text, unique, indexed)                   │   │
│  │    - name (text, nullable)                           │   │
│  │    - source (enum: homepage, blog, contact_form)     │   │
│  │    - subscribed (boolean, default true)              │   │
│  │    - preferences (jsonb: {topics: [], frequency})    │   │
│  │    - created_at (timestamp)                          │   │
│  │    - unsubscribed_at (timestamp, nullable)           │   │
│  │    - last_email_sent (timestamp)                     │   │
│  │    - email_open_count (integer, default 0)           │   │
│  │    - email_click_count (integer, default 0)          │   │
│  │                                                      │   │
│  │  blog_posts                                          │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - slug (text, unique, indexed)                    │   │
│  │    - title (text, not null)                          │   │
│  │    - excerpt (text, max 200 chars)                   │   │
│  │    - content (text, MDX format)                      │   │
│  │    - type (enum: 'blog', 'case_study')               │   │
│  │    - cover_image (text, URL to Supabase Storage)     │   │
│  │    - author_id (uuid, FK to staff_users)             │   │
│  │    - status (enum: draft, published, archived)       │   │
│  │    - published_at (timestamp, nullable, indexed)     │   │
│  │    - created_at (timestamp)                          │   │
│  │    - updated_at (timestamp)                          │   │
│  │    - deleted_at (timestamp, nullable)                │   │
│  │    - views (integer, default 0)                      │   │
│  │    - reading_time (integer, minutes)                 │   │
│  │    - seo_meta (jsonb: {description, keywords, og})   │   │
│  │                                                      │   │
│  │  blog_tags                                           │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - name (text, unique)                             │   │
│  │    - slug (text, unique)                             │   │
│  │    - count (integer, default 0)                      │   │
│  │                                                      │   │
│  │  blog_post_tags (junction table)                     │   │
│  │    - blog_post_id (uuid, FK)                         │   │
│  │    - tag_id (uuid, FK)                               │   │
│  │    Primary key: (blog_post_id, tag_id)               │   │
│  │                                                      │   │
│  │  case_studies (extends blog_posts or separate)       │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - blog_post_id (uuid, FK if extending)            │   │
│  │    - client_name (text)                              │   │
│  │    - industry (enum)                                 │   │
│  │    - challenge (text)                                │   │
│  │    - solution (text)                                 │   │
│  │    - results (jsonb: {metric: value})                │   │
│  │    - testimonial (text, nullable)                    │   │
│  │    - testimonial_author (text, nullable)             │   │
│  │    - project_duration (text: '3 months')             │   │
│  │    - services_used (text[])                          │   │
│  │                                                      │   │
│  │  staff_users                                         │   │
│  │    - id (uuid, primary key, syncs with Supabase Auth)│   │
│  │    - email (text, unique)                            │   │
│  │    - name (text)                                     │   │
│  │    - role (enum: admin, editor, viewer)              │   │
│  │    - avatar_url (text, nullable)                     │   │
│  │    - bio (text)                                      │   │
│  │    - created_at (timestamp)                          │   │
│  │    - last_login (timestamp)                          │   │
│  │                                                      │   │
│  │  email_campaigns                                     │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - type (enum: newsletter, blog_announce, custom)  │   │
│  │    - subject (text, not null)                        │   │
│  │    - content (text)                                  │   │
│  │    - segment (jsonb: filter criteria)                │   │
│  │    - blog_post_id (uuid, nullable, FK)               │   │
│  │    - sent_to_count (integer)                         │   │
│  │    - sent_at (timestamp)                             │   │
│  │    - created_by (uuid, FK to staff_users)            │   │
│  │    - created_at (timestamp)                          │   │
│  │    - scheduled_for (timestamp, nullable)             │   │
│  │                                                      │   │
│  │  email_events                                        │   │
│  │    - id (uuid, primary key)                          │   │
│  │    - campaign_id (uuid, FK)                          │   │
│  │    - subscriber_id (uuid, FK)                        │   │
│  │    - event_type (enum: sent, opened, clicked,        │   │
│  │                  bounced, unsubscribed)              │   │
│  │    - link_url (text, nullable, for clicks)           │   │
│  │    - created_at (timestamp)                          │   │
│  │    - metadata (jsonb)                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STORAGE BUCKETS                                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  blog-images/                                        │   │
│  │    - cover-images/                                   │   │
│  │    - inline-images/                                  │   │
│  │                                                      │   │
│  │  case-study-assets/                                  │   │
│  │    - images/                                         │   │
│  │    - pdfs/                                           │   │
│  │                                                      │   │
│  │  avatars/                                            │   │
│  │    - staff/                                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ROW LEVEL SECURITY (RLS) POLICIES                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Public read access to published blog_posts        │   │
│  │  • Staff can CRUD their own drafts                   │   │
│  │  • Admins can CRUD all content                       │   │
│  │  • Contacts/Subscribers readable by staff only       │   │
│  │  • Email campaigns admin-only                        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  RESEND EMAIL SERVICE                                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EMAIL TYPES                                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  1. Transactional Emails:                            │   │
│  │     • Contact form admin notification                │   │
│  │     • Contact form user confirmation                 │   │
│  │     • Newsletter welcome email                       │   │
│  │     • Password reset (for staff)                     │   │
│  │                                                      │   │
│  │  2. Marketing Emails:                                │   │
│  │     • Weekly/monthly newsletters                     │   │
│  │     • Blog post announcements                        │   │
│  │     • Custom campaigns                               │   │
│  │                                                      │   │
│  │  3. System Notifications:                            │   │
│  │     • New contact received (internal)                │   │
│  │     • Blog published (internal)                      │   │
│  │     • Subscriber milestones (100, 500, 1000)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WEBHOOK INTEGRATION                                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Resend sends events to: /api/webhooks/resend        │   │
│  │  • email.sent                                        │   │
│  │  • email.delivered                                   │   │
│  │  • email.opened                                      │   │
│  │  • email.clicked                                     │   │
│  │  • email.bounced                                     │   │
│  │  • email.complained (spam reports)                   │   │
│  │                                                      │   │
│  │  These events update email_events table              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  OPTIONAL: ADMIN DASHBOARD UI (admin.nextventures.in)       │
│                                                             │
│  Built with Next.js, deployed on Vercel separately          │
│  Uses same API endpoints above with auth token              │
│                                                             │
│  Pages:                                                     │
│  • /admin/dashboard       - Overview stats                  │
│  • /admin/contacts        - Lead management                 │
│  • /admin/subscribers     - Email list management           │
│  • /admin/blogs           - Content management              │
│  • /admin/case-studies    - Case study CRUD                 │
│  • /admin/campaigns       - Email campaign builder          │
│  • /admin/analytics       - Performance metrics             │
│  • /admin/settings        - Team & preferences              │
└─────────────────────────────────────────────────────────────┘