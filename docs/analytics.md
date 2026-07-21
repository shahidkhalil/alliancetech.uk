# Alliance Tech analytics operations

The website emits privacy-safe, snake_case events only after analytics consent. It never sends
names, email addresses, phone numbers, form contents, or admin activity.

## Environment

Copy `.env.example` to `.env.local` for local development:

```env
NEXT_PUBLIC_GA_ID=G-TR2J78K3F0
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_CLARITY_ID=
```

When `NEXT_PUBLIC_GTM_ID` is empty, the site sends events directly to GA4. When a GTM ID is
present, GTM becomes the only event transport. Do not configure a second hard-coded GA4 page-view
tag or page views will be duplicated.

## Google Analytics 4

In GA4 Admin, verify the web data stream uses measurement ID `G-TR2J78K3F0`.

Mark these events as key events:

- `contact_form_submit`
- `quote_request`
- `phone_click`
- `whatsapp_click`
- `calendly_booked`
- `book_consultation`
- `demo_complete`
- `email_click`

Create event-scoped custom dimensions for:

- `service`
- `route_name`
- `button_location`
- `click_text`
- `lead_source`
- `form_id`
- `demo_type`
- `audit_mode`
- `video_title`
- `percent_scrolled`
- `metric_name`
- `metric_rating`
- `utm_content`
- `utm_term`

GA4 automatically supplies users, sessions, engagement, source/medium, campaign, country, device,
browser, landing page, new/returning users, and approximate geography.

## Google Tag Manager

Create a Web container and add its `GTM-...` ID to the environment.

Recommended tags and triggers:

1. GA4 Configuration tag, triggered on Consent Initialization after `analytics_storage` is granted.
2. One GA4 Event tag using `{{Event}}` as the event name and data-layer variables for the custom
   dimensions above.
3. A Custom Event trigger matching:
   `page_view|service_view|contact_form_submit|quote_request|phone_click|whatsapp_click|email_click|demo_start|demo_complete|book_consultation|blog_view|video_complete|download|site_search|scroll_depth|error|performance_metric`.
4. History Change, click, form, scroll, and timer triggers should be used only for QA or tags not
   already emitted by the application. The application already emits these events.
5. Use GTM Preview and GA4 DebugView before publishing.

Consent Mode v2 keys emitted by the site:

- `analytics_storage`
- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `functionality_storage`
- `personalization_storage`
- `security_storage`

## Microsoft Clarity

Create a Clarity project for `alliancetechltd.com`, add its project ID to
`NEXT_PUBLIC_CLARITY_ID`, and redeploy. Clarity loads only after analytics consent. Use Clarity for
heatmaps, recordings, dead clicks, rage clicks, quick backs, scroll maps, and client-side errors.
Mask sensitive content in the Clarity project settings as an additional safeguard.

## Google Search Console

1. Verify the Domain property for `alliancetechltd.com` by DNS.
2. Submit only `https://alliancetechltd.com/sitemap.xml`.
3. Use URL Inspection, not the Sitemaps screen, to request indexing for individual pages.
4. Connect Search Console to GA4 under GA4 Admin > Product links.

The site provides robots rules, canonicals, Open Graph/Twitter metadata, Organization/WebSite,
Service, Breadcrumb, FAQ, and Article structured data.

## Looker Studio

Connect:

- GA4 for traffic, users, sessions, engagement, events, conversions, pages, campaigns, countries,
  and devices.
- Search Console Site Impression and URL Impression tables for queries, clicks, impressions,
  CTR, average position, and landing pages.
- A CRM or order source for revenue. GA4 alone cannot provide reliable closed-revenue attribution.

Recommended KPI cards:

- Users and sessions
- Lead/key-event count
- Session-to-lead conversion rate
- Organic, direct, referral, and LinkedIn traffic
- Average engagement time
- Top service and landing page
- Best Search Console query
- Most clicked CTA
- Most viewed blog
- Demo completion rate
- Contact form conversion rate

Recommended weekly report:

- Users, sessions, organic traffic, leads, conversion rate
- Top queries, pages, referrers, countries, devices, and CTAs

Recommended monthly report:

- Traffic, lead, and organic-search growth
- Best/worst landing pages
- Query and ranking changes
- Service demand
- Campaign conversion performance
- Revenue attribution from the connected CRM/order source

## Event interpretation

- `element_click` is exploratory interaction data; do not add it to conversion totals.
- `form_start` and `form_abandon` identify funnel drop-off.
- `contact_form_submit`, `quote_request`, and `demo_complete` represent successful outcomes.
- `page_view` excludes query strings to prevent URL fragmentation; campaign parameters are stored
  as separate dimensions.
- Google Ads keywords are available through linked Ads data. Organic queries come from Search
  Console; GA4 does not expose most organic keyword text by itself.

## QA checklist

1. Clear `alliance_consent_v1` in local storage.
2. Confirm no GA/GTM/Clarity network request before consent.
3. Reject optional cookies and confirm tracking remains disabled.
4. Accept analytics and confirm exactly one `page_view`.
5. Verify semantic events in GA4 DebugView or GTM Preview.
6. Confirm `/admin` sends no analytics.
7. Inspect payloads for personal data before each release.
