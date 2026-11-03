# Monetization and go-to-market for NETZ (solo-founder Indian student web app)

> Research date: 2026-11-03. Two research rounds (about 22 searches/fetches). Every number below has its source next to it, and anything without a source is in Inferences or Gaps. Many sources are agency, vendor or coupon blogs rather than primary data, and they are flagged where that matters.

## Q1. Ad revenue: AdSense/Ad Manager RPM for Indian education traffic, ad blockers, approval, alternatives, and what 100k Indian pageviews earn

### Takeaway
Indian education traffic earns little from display ads. Blog benchmarks put education/technology page RPM in India at about ₹165–415 per 1,000 pageviews in 2026, and education ranks near the bottom of AdSense niches. Premium networks (Mediavine) want about 50k sessions a month and favour Tier-1 traffic, so plan on AdSense or Ezoic. AdSense often rejects new sites as "low value content" until they have original pages and some history, and thin templated pages are a known violation. At 100k Indian pageviews a month, ads are likely worth tens of thousands of rupees a month at most.

### Cited Findings
- India-focused 2026 benchmark table (a blog): technology and education ₹165–415 RPM; finance and insurance ₹250–830 RPM. — [upgrowth.in: how to calculate AdSense earnings India](https://upgrowth.in/how-to-calculate-google-adsense-earnings-india/)
- Another blog's example of an education blog with Indian traffic assumes a CPC of about ₹12. — [Ranktracker: AdSense pay for 1,000 views in India](https://www.ranktracker.com/it/blog/how-much-does-adsense-pay-for-1-000-views-in-india/)
- Among AdSense niches, finance pays the most, then healthcare and technology; "education brings up the rear". — [Neworld Media: top 10 highest-paying AdSense niches](https://newormedia.com/blog/top-10-highest-paying-adsense-niches/)
- For comparison (a different product and metric), YouTube education/science RPM in India is about US$1.60–3.60 per 1,000 views. The same source says education creators earn more from courses and affiliates than from AdSense. — [ytgrowth.io: education creator earnings, India](https://ytgrowth.io/youtube-earnings/education/india)
- **AdSense approval** (community posts and blogs; Google's official eligibility page was not retrieved):
  - "Low value content" is Google's catch-all rejection for new sites, and the cause is often timing (a domain with no history) rather than quality. One author suggests 3–6 months of history. — [toolpod.dev: AdSense rejection, low value content](https://toolpod.dev/blog/adsense-rejection-low-value-content); [Google AdSense community guide](https://support.google.com/adsense/community-guide/241032356/how-can-you-solve-the-low-value-content-adsense-disapproval-challenge?hl=en)
  - Another guide says there is no fixed age or traffic threshold; the bar is original content, policy compliance and an applicant aged 18 or over. — [theguidex: AdSense approval](https://theguidex.com/google-adsense-approval/)
  - One blogger's rule of thumb is at least 15 unique original pages. — [helloacm](https://helloacm.com/minimal-adsense-requirement-15-unique-posts-counter-low-value-content/)
  - AdSense has a "valuable inventory: templated page" violation for pages generated from a template. This is directly relevant to programmatic SEO pages. — [MonetizeMore: templated page violation](https://www.monetizemore.com/blog/how-deal-with-valuable-inventory-templated-page-violation-adsense)
- **Mediavine and Ezoic thresholds:**
  - **Mediavine** (main programme): about 50,000 sessions in the last 30 days; traffic country and content quality also count.
  - **Journey by Mediavine** (entry tier, 2024): sources disagree on 1,000 vs 10,000 monthly sessions, and 10,000 looks more current.
  - **Ezoic:** no fixed minimum traffic; it checks quality and policy compliance.
  - Mediavine RPM averages of about US$15–35 reflect US-heavy traffic, and no India figure was found.
  — [ppc.land: premium ad network approvals](https://ppc.land/is-your-site-finally-ready-the-new-math-behind-premium-ad-network-approvals/); [Hostragons: Ezoic vs Mediavine](https://www.hostragons.com/en/blog/ezoic-vs-mediavine-application-criteria-earnings-comparison/); [bloggingguide](https://bloggingguide.com/?p=273208)
- **Ad blockers in India: sources conflict.**
  - A DoubleVerify-based report (headline) says 48% of Indian consumers use ad blockers. — [MediaNews4U](https://www.medianews4u.com/48-of-indian-consumers-use-ad-blockers-slightly-above-global-average-doubleverify/)
  - A GWI figure gives 44% for mobile. — [VoxBooster](https://voxbooster.com/fr/blog/ad-blocker-statistics-2026/)
  - A page citing Statista gives 7% for mobile (2024). — [WifiTalents](https://wifitalents.com/india-advertising-industry-statistics/)
  - Statista's January 2025 study covers 53 countries, but India's value was not visible. — [Statista](https://www.statista.com/forecasts/1452667/share-of-consumers-using-ad-blockers-in-selected-countries-worldwide)

### Inferences
- **100k Indian pageviews a month:** at the blog's ₹165–415 RPM, gross revenue is about **₹16,500–41,500 a month**. That rate is probably optimistic for a new, mostly mobile maths tool where one long solver session is a single pageview, ad blocking takes a slice, and a new site starts with weak ad fill. A safer planning figure is **₹5,000–25,000 a month**. This is my judgement and has no source.
- Ads should run only on public SEO pages (method explainers, worked examples), never inside the playground or notes, and "no ads" should be a paid perk.
- **Programmatic SEO risk:** thousands of near-identical "X method calculator" pages could trigger AdSense's templated-page violation. Each page should carry unique worked content.

### Gaps
- Google's official AdSense eligibility page was not fetched.
- No primary (Google) RPM data for India; all rupee RPM figures come from SEO blogs.
- India's ad-blocker share is unresolved (7% vs 44–48%).
- No India RPM numbers for Ezoic or Journey.
- Carbon Ads was not researched; it targets a developer audience, so it is likely a poor fit for students.

## Q2. Subscriptions: conversion rates, Indian prices, UPI AutoPay/e-mandate rules, Razorpay fees, mandate success rates

### Takeaway
Plan on about 1.5–3% of active users paying:
- RevenueCat (2026): India's median download-to-paid rate is 1.4% by day 35.
- First Page Sage: average freemium conversion is 3.7%, with EdTech the lowest industry at 2.6%.

Razorpay charges about 2% + 18% GST on domestic UPI and cards, with no setup fee. RBI's E-Mandate Framework 2026 keeps debits up to ₹15,000 free of extra authentication, requires a pre-debit notice at least 24 hours ahead, and bans charging customers for mandates. Indian exam-prep competitors price aggressively; Testbook Pass sells at about ₹300–500 a month or ₹350–400 a year after discounts. No independent UPI AutoPay success rate was found, only vendor claims.

### Cited Findings
- **Conversion benchmarks:**
  - **RevenueCat 2026:** median download-to-paid by day 35 is 2.0% for all apps, 2.6% in North America, 2.0% in Western Europe and **1.4% in India and Southeast Asia**. Education shows one of the widest gaps between the upper quartile and the top 10%. — [RevenueCat report](https://revenuecat.com/report); [Data Analysis Journal](https://dataanalysis.substack.com/p/2026-benchmarks-more-apps-less-quality)
  - **First Page Sage:** average freemium-to-paid conversion is 3.7%, ranging from **2.6% in EdTech** (lowest) to 5.8% in RegTech. — via [ChartMogul / CrazyEgg / Lago summaries](https://www.crazyegg.com/blog/free-to-paid-conversion-rate/)
  - **ChartMogul (self-serve SaaS):** 3–5% is "good" and 8–12% "great"; about a quarter of freemium products convert under 2.5%. — [ChartMogul conversion report](https://chartmogul.com/reports/saas-conversion-report/)
  - **Consumer subscriptions:** conversion is strongly correlated with daily engagement. — [Parsa: consumer subscription KPI benchmarks](https://parsa.substack.com/p/consumer-subscription-kpi-benchmarks-retention-engagement-and-conversion-rates-9ac13b57c3d3)
  - Business of Apps reports education apps at 30% (Google Play) and 16% (iOS) in 2024. The metric is undefined and likely trial-to-paid, so it is not comparable to the figures above. — [Business of Apps](https://www.businessofapps.com/?p=95464)
- **Indian price anchors (coupon sites, so prices are discounted and may be dated):**
  - Testbook merged its Pass tiers into one "Testbook Pass". Monthly plans are listed at ₹299–499; a yearly pass is listed at about ₹349–399, against list prices of about ₹999 monthly and ₹1,999 yearly. — [Zoutons](https://www.zoutons.com/testbook-coupons); [GoPaisa monthly](https://www.gopaisa.com/books-sale-offers-deals-coupons/testbook-all-exams-unlimited-tests-monthly-pass); [GoPaisa yearly](https://www.gopaisa.com/books-sale-offers-deals-coupons/testbook-all-exams-unlimited-tests-yearly-pass-at-75-off)
- **Razorpay fees:**
  - Domestic UPI and standard methods for subscriptions: 2% + 18% GST on the fee. No setup fee, no annual maintenance charge, no minimums.
  - International subscriptions: 2% + 0.99% subscription fee + GST.
  — [Razorpay pricing explained](https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/); [Razorpay subscriptions blog 2026](https://razorpay.com/blog/payment-gateway-support-for-subscription-businesses-key-considerations-in-2026/)
- **Possible pending change (unverified):** one article reports a 0.4% MDR on UPI payments above ₹2,000 from 15 Oct 2026. It would not affect ₹49–199 plans. — [rohitraj.tech](https://rohitraj.tech/en/notes/razorpay-vs-stripe-india-mvp-2026)
- **What Razorpay Subscriptions supports:**
  - payment methods: cards, e-mandate via netbanking or debit card, and UPI AutoPay (40+ banks);
  - billing intervals: daily, weekly, monthly, quarterly or yearly;
  - plan features: trials, upfront charges, add-ons, and proration on upgrades/downgrades.
  — [Razorpay Subscriptions](https://razorpay.com/subscriptions/)
- **UPI AutoPay limits and retries:**
  - ₹15,000 per debit for most merchants, and up to ₹1,00,000 for specified merchant categories.
  - Each debit gets one attempt plus up to 3 retries.
  — [eximpe: UPI AutoPay for SaaS](https://eximpe.com/blog/saas/upi-autopay-for-saas-setup-limits-and-what-global-founders-need-to-know); [Razorpay docs](https://razorpay.com/docs/payments/subscriptions/supported-payment-methods.md)
- **UPI AutoPay success rates (vendor claims only; no NPCI or RBI figure exists):**
  - Cashfree claims a "35% higher success rate" than other recurring methods, with no baseline given. — [Cashfree UPI AutoPay](https://cashfree.com/upi-autopay)
  - One guide says card mandates often reach about 70%+ raw success, and UPI AutoPay has lower approval ratios yet now carries most recurring volume. — [Razorpay: UPI AutoPay vs card e-mandates](https://razorpay.com/blog/upi-autopay-vs-card-e-mandates/)
  - Razorpay says over 120 million UPI AutoPay mandates are created each month in India. — [Razorpay AutoPay guide](https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide/)
  - Common failure causes: low balance at debit time, NPCI peak-hour throttling, and users abandoning the app-redirect step during mandate setup. — [Cashfree: SaaS payment failures India](https://www.cashfree.com/blog/saas-payment-failures-india/)
  - Metrics worth tracking: mandate activation rate, first-debit success, renewal success, failure reasons, and retry recovery. — [PayU](https://payu.in/blog/upi-autopay-mandate-subscription-payments/)
- **RBI Digital Payments – E-Mandate Framework, 2026:**
  - notified and effective 21 April 2026; it replaces the earlier circulars;
  - covers cards, PPIs and UPI;
  - no AFA needed for recurring debits up to ₹15,000; higher limits apply only to insurance, mutual funds and credit-card bills;
  - creating, changing or cancelling a mandate needs AFA;
  - a pre-debit notice is due at least 24 hours before each debit, plus a post-debit notice; both must offer an opt-out;
  - no charges may be levied on customers for e-mandates.
  — [SCC Online](https://www.scconline.com/blog/post/2026/04/24/rbi-issues-digital-payments-e-mandate-framework-2026/); [Business Today](https://www.businesstoday.in/amp/personal-finance/news/story/rbi-auto-pay-rules-changed-what-happens-to-your-sips-otts-and-other-payments-526829-2026-04-22)

### Inferences
- **Revenue model:**
  - Example: 10,000 monthly active users × 2% paying × ₹99 ≈ **₹19,800 a month gross**, or about ₹19,300 after Razorpay's ~2.36% all-in fee.
  - ₹1 lakh a month therefore needs about 50k monthly active users at ₹99.
  - Ads and subscriptions together at 50k monthly active users probably land at about ₹1–1.5 lakh a month. This is an estimate.
- **Pricing:**
  - Testbook anchors students to about ₹300–400 a year for a full exam-prep pass, so NETZ should not price above that.
  - A **₹49–99/month or ₹299–499/year** range, plus a one-off "semester pass" sold before exams, fits the market.
  - Yearly and semester passes paid once avoid AutoPay failures and the cancellation moment created by each 24-hour pre-debit notice.
- NETZ must not pass any mandate fee to users, because the 2026 framework bans it.

### Gaps
- No independent UPI AutoPay success rates; only vendor figures exist.
- Chegg India pricing was not found.
- Official Testbook, PhysicsWallah and Unacademy price lists were not fetched.
- The 0.4% UPI MDR above ₹2,000 is unverified.

## Q3. Gamification: evidence that streaks and badges help retention, the risks, and rules for a virtual currency

### Takeaway
Duolingo's public data shows streaks at scale: more than 10 million users on 1-year-plus streaks, and DAU/MAU of 34.7% in Q4 2024. Its retention team says the first 7 days are the key window: retention jumps between day 1 and day 2 of a streak and flattens after day 7. Most experiment-level evidence comes from podcast summaries, not primary data.

### Cited Findings
- **Duolingo FY2024 shareholder letter (Feb 2025):**
  - DAU/MAU rose by more than 4 points year over year to 34.7% in Q4 2024;
  - more than 10 million users have streaks of a year or longer;
  - one-third of DAUs have a Friend Streak.
  — [Duolingo Q4 FY24 letter (SEC)](https://www.sec.gov/Archives/edgar/data/1562088/000156208825000039/q4fy24duolingo12-31x24shar.htm)
- **Recent Duolingo results:**
  - Q3 2025: more than 50M DAUs, +36% year over year. — [Duolingo Q3 FY25 (SEC)](https://www.sec.gov/Archives/edgar/data/1562088/000162828025049514/q3fy25duolingo9-30x25press.htm)
  - Q4 2025: 52.7M DAUs, +30%, with growth slowing through 2025.
  - Q2 2026: 58.7M DAUs, +23%. Current user retention rate was about 84% (from a partial snippet). A June campaign revived 15.4M streaks.
  — [Bullfincher: FY2026 Q2 call](https://bullfincher.io/companies/duolingo/earnings-call/fy2026-q2); [Longport](https://longportapp.cn/news/295028818)
- **Duolingo retention team** (Lenny's Podcast; secondary summaries): retention rises sharply from a 1-day to a 2-day streak, then flattens after about day 7. The team focuses experiments on getting new users to a 7-day streak. — [Lenny's Newsletter](https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks); [Recall summary](https://www.recall.it/summary/lennys-podcast/behind-the-product-duolingo-streaks-or-jackson-shuttleworth-group-pm-retention-team)
- Changing the button text to "commit to my goal" reportedly raised retention, and a notification-copy test reportedly raised DAU by about 5%. Both are secondary sources. — [Lazyweb](https://lazyweb.com/research/duolingo-retention-experiments); [Taplytics](https://taplytics.com/blog/how-duolingo-ran-an-experiment-on-their-streaks-feature)
- Streak Freeze is sold with in-app currency; no published figure isolates its retention effect. — [Medium](https://medium.com/@theniteshknows/how-duolingo-reignited-user-growth-a-masterclass-in-gamification-strategy-2bc2d40e1876)
- Consumer subscription conversion correlates strongly with daily engagement, which links streaks to revenue. — [Parsa](https://parsa.substack.com/p/consumer-subscription-kpi-benchmarks-retention-engagement-and-conversion-rates-9ac13b57c3d3)

### Inferences
- For NETZ:
  - make reaching a 7-day streak the main onboarding goal;
  - make gems spendable on streak freezes;
  - tie the daily streak action to real learning (one solved or checked step), not just opening the app.
- Student usage clusters around exams (see Q5). A weekly goal or exam-season "sprints" may fit better than a strict daily streak. This is a hypothesis.

### Gaps
- No primary study was collected on shallow-engagement risks or on gamification for studying maths.
- Virtual-currency design rules (earn/spend balance, inflation) are unsourced.

## Q4. Acquisition channels for Indian engineering students, and paid ad costs

### Takeaway
Paid ads are cheap per click in India but do not pay back for a ₹99 product: Meta edtech cost per purchase is quoted at ₹400–2,500. Organic search clicks are shrinking under AI Overviews (Ahrefs: −58% click-through for the top result, December 2025 data). Indian edtechs have grown mainly through YouTube, Telegram and campus ambassadors, but there is no hard cost or conversion data on those channels.

### Cited Findings
- **Meta ad costs for India education, 2025–26 (agency blogs, wide ranges):**
  - **Cost per lead:** ₹150–400 (OwlClaw); ₹40–200 for lead forms (Codingclave); ₹150–800 by programme and city tier (Sotros).
  - **Cost per click:** about US$0.09 for Indian education (Superads); ₹0.50–2 across all industries (PW Skills).
  - **CPM:** India paid social about US$1.20–3.50 (Sotros); edtech CPM ₹150–400 (Codingclave).
  - **Cost per purchase:** ₹400–2,500 for edtech (Codingclave).
  — [OwlClaw](https://owlclaw.com/benchmarks/education-marketing-benchmarks); [Codingclave](https://codingclave.com/guides/meta-ads-management-india-2026-facebook-instagram); [Sotros CPL](https://sotrosinfotech.com/blog/meta-ads-cost-per-lead-education-india-southeast-asia-2026/); [Sotros benchmarks](https://sotrosinfotech.com/blog/paid-social-ads-benchmarks-india-southeast-asia-2026/); [Superads](https://www.superads.ai/facebook-ads-costs/cpc-cost-per-click/education/india); [PW Skills](https://pwskills.com/blog/facebook-ads-cost-digital-marketing)
- Meta ad prices rose 14% globally in Q3 but only 1% in APAC. — [exchange4media](https://www.exchange4media.com/digital-news/metas-ad-prices-rise-14-globally-in-q3-just-1-in-apac-the-india-equation-159408.html)
- **AI Overviews and search clicks:**
  - **Pew (July 2025):** people clicked a result 8% of the time when an AI summary appeared, versus 15% without one. Google disputes the methodology. — [Search Engine World](https://www.searchengineworld.com/pew-data-confirms-50-reduction-in-serp-click-through-rates)
  - **Ahrefs:** the top-ranking page gets 34.5% fewer clicks (April 2025), updated to 58% (December 2025 data). — [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
  - **Seer Interactive:** click-through fell from 1.76% to 0.61% on queries with an AI Overview, but queries without one also fell 41%. — [tryanalyze](https://www.tryanalyze.ai/blog/ai-overviews-reduce-clicks)
- **Telegram:** Telegram became a go-to test-prep platform in India, with groups sharing lectures and PDFs, but it has a piracy problem. — [FactorDaily](https://archive.factordaily.com/telegram-turns-go-to-platform-for-test-prep-in-india-but-has-a-piracy-problem/); [Inc42: NEET, Telegram ban and the edtech void](https://inc42.com/features/neet-telegram-ban-and-the-edtech-void/)
- **YouTube:** Indian edtechs built their own platforms but "relied massively on YouTube" to broadcast their products. — [The Ken: Ed Set Go](https://the-ken.com/edsetgo/indian-students-are-using-edtech-just-not-the-way-you-think/)
- **Campus ambassadors:** programmes run by Indian edtechs such as Leverage Edu (job listings). One claim that up to 40% of high-ROI edtech spend goes to campus and influencer activity comes from an uncited Scribd document, so it is unreliable. — [Promilo: Leverage Edu campus ambassador](https://www.promilo.com/internships-description/edtech/lebadmincom-campus-ambassador-1/campus-ambassador); [Scribd](https://www.scribd.com/document/903592044/EXP)

### Inferences
- **Unit economics:** a cost per purchase of ₹400–2,500 against ₹99/month means paid acquisition loses money at launch. Use paid ads only for retargeting or exam-week bursts.
- **SEO:** an AI Overview can absorb a static formula answer but not an interactive solver working on the user's own numbers. Pages should lead with the tool and university-syllabus wording (for example "Gauss-Seidel VTU exam question"), with unique worked content on each page (see the templated-page risk in Q1).
- **Zero-budget plan:**
  - YouTube Shorts showing a solved exam question step by step, linking to the tool;
  - Telegram/WhatsApp exam groups in the 2–4 weeks before exams;
  - a few campus ambassadors paid in gems or free Pro;
  - outreach to YouTube educators who teach M3/numerical methods, offering free Pro or embeds.
  These are untested hypotheses.

### Gaps
- No cost or conversion data for ambassadors, Shorts/Reels, Reddit (r/Indian_Academia, r/GATEtard), LinkedIn or faculty adoption.
- No Google Ads cost-per-click data for Indian education.
- No data on how AI Overviews affect calculator sites specifically.

## Q5. Seasonality, case studies and B2B options

### Takeaway
GATE 2027 runs on 6–7, 13–14 and 20–21 February 2027 (IIT Madras). Case studies point to two models:
- **Free tool funded by others:** Desmos is free for students and paid for by publishers and test makers.
- **Viral or SEO tool later acquired:** Symbolab (more than 50M students, bought by Course Hero in 2020) and Photomath (launched at TechCrunch Disrupt 2014, 220M+ downloads, bought by Google in 2022–23).

GeeksforGeeks shows the Indian path: a placement-prep blog started in 2009 that grew into a company with tens of crores of revenue.

### Cited Findings
- **GATE 2027:** conducted by IIT Madras on 6, 7, 13, 14, 20 and 21 February 2027 (six days, up from four). City allotment 4 January 2027; results 19 March 2027. — [Careers360](https://engineering.careers360.com/articles/gate-2027); [IIT Madras press release](https://www.iitm.ac.in/happenings/press-releases-and-coverages/iit-madras-announces-dates-syllabus-revision-new-paper); [PW](https://www.pw.live/gate/exams/gate-2027-exam-date-out)
- **GeeksforGeeks:**
  - Sandeep Jain started a blog in 2009 to help engineering students prepare for placements, then left his job to build it. — [YourStory 2022](https://yourstory.com/2022/06/100x-engineer-teacher-entrepreneur-sandeep-jain-geeksforgeeks/amp)
  - Revenue figures conflict: ₹66.18 crore in FY2025 standalone filings per Startup Atlas, versus about ₹84 crore or US$10M reported elsewhere. — [Startup Atlas](https://lapaasvoice.com/startup/geeksforgeeks/financials/); [Everybodywiki](https://en.everybodywiki.com/GeeksForGeeks)
- **Symbolab:**
  - Founded around 2011 in Tel Aviv. — [startupim](https://startupim.com/company/symbolab)
  - Acquired by Course Hero in October 2020 for an undisclosed sum; it was kept as a separate brand and used as a perk for Course Hero subscribers. — [TechCrunch 2020](https://techcrunch.com/2020/10/27/course-hero-symbolab-makes-a-rare-edtech-acquisition/amp/); [EdSurge](https://edsurge.com/news/2020-10-27-course-hero-makes-first-acquisition-since-joining-unicorn-club)
  - More than 50M students and about 1 billion questions in 2020 (unverified directory figure). — [tooldirectory.ai](https://tooldirectory.ai/tools/symbolab)
- **Photomath:**
  - Launched as a text-recognition demo at TechCrunch Disrupt London 2014 and topped the App Store the day after. — [5g.hr](https://5g.hr/?p=19448); [Total Croatia News](https://total-croatia-news.com/news/business/photomath-5/)
  - Downloads: 100M (2018) and 220M+ (2021, when it raised $23M). — [TechCrunch 2021](https://techcrunch.com/2021/02/18/math-learning-app-photomath-raises-23-million-as-it-reaches-220-million-downloads); [TechCrunch 2018](https://techcrunch.com/2018/11/06/photomath-raises-6-million-for-its-math-solving-app/amp/)
  - Google announced the acquisition in May 2022; it completed in 2023. — [SeeNews](https://seenews.com/news/google-to-take-over-croatian-edtech-app-photomath-815392); [9to5Google](https://9to5google.com/2024/02/29/photomath-google-app/)
- **Desmos (B2B model):**
  - Free for students and teachers; revenue comes from paid partnerships with publishers, test makers and institutions.
  - Partners include College Board (the official SAT calculator), Pearson and Smarter Balanced (2017).
  — [EdSurge 2017](https://edsurge.com/news/2017-05-08-desmos-passes-the-smarter-balanced-test-and-hopes-to-save-math-students-100); [Smithsonian](https://www.smithsonianmag.com/smart-news/pricey-graphing-calculators-are-going-extinct-180963212/); [EdWeek](https://www.edweek.org/teaching-learning/smarter-balanced-to-embed-desmos-online-graphing-calculator-in-math-tests/2017/05)

### Inferences
- **Seasonality:** expect traffic peaks before university end-semester exams and before GATE (January to mid-February 2027), and lows in the breaks. Exam-week campaigns and semester passes should match these windows.
  - The "Nov–Dec and May–June" semester-exam pattern was not checked against university calendars.
- **Lessons from the case studies:**
  - GeeksforGeeks: compounding content aimed at a specific Indian student need (placements) can build a large bootstrapped business, but it took more than a decade.
  - Photomath: one striking "wow" demo (camera → solved steps) drove virality. NETZ's handwriting → step-by-step solution could serve as the Shorts/Reels hook.
  - Desmos: B2B can fund a free tool. For NETZ, the equivalent could be licences for coaching institutes or colleges (faculty dashboards, embeds in their course material), or white-label solvers for Indian edtech or publisher platforms. These are hypotheses with no Indian pricing data.

### Gaps
- Semester exam calendars for AKTU, VTU, Mumbai University and Anna University were not collected.
- Google Trends seasonality for numerical-methods searches in India was not collected.
- The atozmath and Gate Overflow growth stories were not researched.
- Indian B2B pricing for college or coaching licences, and examples of Indian institutes buying such tools, were not found.
- How Symbolab grew before its acquisition (SEO tactics, traffic) was not found.
