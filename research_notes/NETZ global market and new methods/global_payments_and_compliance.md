# Global payments, pricing, tax, privacy and ads for NETZ (Indian solo founder selling worldwide)

Research date: 2026-11-03. Not legal or tax advice. Most fee figures come from vendor pages (which change often) or from competitor blogs (which have a commercial bias). Re-check every number on the provider's own pricing page before launch. A CA (for GST/FEMA) and a privacy lawyer (for children's data) are needed before taking money from abroad and before allowing under-18 sign-ups.

Context: NETZ_LAUNCH_PLAN.md currently says "Razorpay only, rupees only in test mode". This note covers what changes if NETZ sells outside India.

## Payments abroad: Razorpay International, Stripe India, and merchant-of-record (MoR) options

### Takeaway
Razorpay International (about 3% + GST on cards) is the simplest add-on to the current Razorpay setup. But NETZ then becomes the seller of record and owns foreign VAT and sales tax itself. Stripe India is still invite-only. MoR options that pay out to India and handle global tax include Paddle (5% + 50¢), Dodo Payments (4% + 40¢, plus 1.5% international and 0.5% subscription surcharges) and Lemon Squeezy / Stripe Managed Payments (5% + 50¢). On a cheap consumer plan, the fixed per-transaction fee is the biggest cost.

### Cited Findings
**Razorpay International**
- Razorpay advertises international card acceptance in about 135 currencies. One Razorpay docs mirror says 160+, so the official count is unclear — [Razorpay accept international payments](https://razorpay.com:443/accept-international-payments); [Razorpay docs: international payments](https://razorpay.com/docs/payments/international-payments); [Axis-Razorpay docs mirror](https://axisbank-docs.razorpay.com/payments/international-payments/)
- International card fee is reported as 3% + 18% GST on the fee. International bank transfers are reported at 1% + GST. These are third-party figures — [Xflow: Razorpay international charges 2026](https://www.xflowpay.com/blog/razorpay-international-payment-gateway-charges); [Skydo comparison](https://www.skydo.com/compare/paypal-vs-razorpay)
- One competitor comparison reports cross-border settlement of about T+7 business days. Razorpay's pricing page does not state a settlement cycle, so confirm it with Razorpay — [Skydo comparisons](https://www.skydo.com/compare/wise-vs-razorpay)
- International payments are a separate activation on Razorpay. Its docs cover supported products, currencies and purpose codes. I found no published activation fee — [Razorpay docs](https://razorpay.com/docs/payments/international-payments)

**Stripe India**
- New Stripe India accounts are invite-only. Businesses "must reach out to your Stripe account team or request an invite". Existing active accounts stay supported — [Stripe support: invite-only in India](https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india); [The Paypers](https://thepaypers.com/payments/news/stripe-moves-to-invite-only-in-india)
- A 2026 guide says Stripe went invite-only in May 2024 and that general availability had not resumed despite plans for late 2025 — [Winvesta](https://www.winvesta.in/blog/businesses/stripe-alternatives-for-india-best-payment-platforms-for-freelancers-and-businesses)
- For export of services, Stripe India needs a Transaction Purpose Code. An IEC is optional, except that AMEX acceptance needs one. Export charges need opt-in during the application — [Stripe: accepting international payments from India](https://support.stripe.com/questions/accepting-international-payments-from-stripe-accounts-in-india); [Stripe docs: india-exports](https://docs.stripe.com/india-exports)

**Paddle (MoR)**
- The official price is "5% + 50¢ per Checkout transaction". It includes global tax compliance ("collects the applicable tax, tracks filing deadlines, and submits sales tax returns"), fraud protection, chargebacks and buyer support, with no monthly fees. Products under $10 should contact Paddle for bespoke pricing — [Paddle pricing](https://www.paddle.com/pricing)
- Payouts are monthly, by the 15th. There is no fee when the payout is in the local currency of the destination. Otherwise bank transfers cost $/€/£15 — [Paddle: when and how do I get paid](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid); [Paddle: payout fees](https://paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts)
- A third-party blog reads Paddle's payout-currency list as 13 currencies without INR. If so, an Indian bank account would receive USD (or another currency) and could pay the $15 fee. Unverified — [Dodo blog on Paddle fees](https://dodopayments.com/zh/blogs/paddle-fees-explained)
- Paddle has an India payments explainer — [Paddle blog: payments in India](https://www.paddle.com/blog/payments-in-india)

**Dodo Payments (Indian-founded MoR)**
- The official pricing page lists 4% + $0.40 base (US cards), +1.5% for cards outside the US, and +0.5% for subscriptions. A refund costs $1 and a dispute $30. Tax calculation, filing and reporting are included "across 190+ countries". Payouts are free, except $5 on payouts under $1,000. USD SWIFT payouts for non-US businesses cost $25. It supports 80+ currencies through "Adaptive Currency", where the customer pays a 2–4% FX fee — [Dodo pricing](https://dodopayments.com/pricing)
- Conflict: search snippets of older Dodo docs list an Indian-merchant payout fee of "$5 + 1%" for international payouts. The current pricing page shows "$5 under $1,000 / $25 SWIFT" instead. Confirm in the dashboard — [Dodo docs fee page (now redirects to pricing)](https://docs.dodopayments.com/miscellaneous/pricing-and-fee-structure)
- Dodo positions itself as the legal seller that handles sales tax and sends one consolidated payout to an Indian bank — [Dodo blog: get paid in USD in India](https://dodopayments.com/blogs/get-paid-usd-developer-india)

**Lemon Squeezy / Stripe Managed Payments**
- Lemon Squeezy (Stripe-owned since 2024) charges 5% + 50¢. A January 2026 Lemon Squeezy update said the team is building toward Stripe Managed Payments and admitted slower support. No shutdown date has been announced — [Fungies](https://fungies.io/lemon-squeezy-stripe-acquisition-saas-founders-2026/); [issoh.co.jp](https://www.issoh.co.jp/tech/details/18599/)
- Stripe Managed Payments (Stripe as MoR) reportedly reached API preview on 25 Feb 2026 and the regular API on 22 Apr 2026. It works only with Checkout and Payment Links, needs Stripe Billing for subscriptions, and reportedly has the same 5% + 50¢ fee. These are secondary sources — [inkfluenceai](https://www.inkfluenceai.com/blog/how-to-sell-ebooks-on-lemon-squeezy-2026); [Dodo blog](https://dodopayments.com/blogs/lemon-squeezy-vs-stripe/)
- An October 2026 snapshot lists the legal seller as "Sold through Link, LLC, formerly Lemon Squeezy LLC" — [Dodo blog: LemonSqueezy alternatives](https://dodopayments.com/blogs/lemonsqueezy-alternatives)

**GST and FEMA on export income (applies when NETZ is the seller, e.g. Razorpay International)**
- Export of services is zero-rated, not exempt. Under an LUT, no IGST is charged and unused input tax credit (ITC) can be refunded. You file the LUT on the GST portal under Services > User Services > Furnish LUT. A regular GST registration is required — [Tally: GST for SaaS exports](https://tallysolutions.com/gst/gst-software-saas-exports-international-clients/); [Razorpay blog: export services GST conditions](https://razorpay.com/blog/export-services-gst-conditions-guide/)
- The service counts as an export only if all the Section 2(6) IGST Act conditions hold: supplier in India, recipient outside India, place of supply outside India, payment in convertible foreign exchange, and the parties are not establishments of the same entity — [Tally](https://tallysolutions.com/gst/gst-software-saas-exports-international-clients/)
- The proof of foreign-exchange receipt is the FIRC or its digital form, the eFIRA. Missing FIRCs or wrong purpose codes stall refunds. Receipts through PayPal or Wise count if you hold a FIRC or eFIRA. Fees charged by the platform still carry 18% GST — [Skydo: FIRA and GST refund for SaaS](https://www.skydo.com/blog/fira-gst-refund-saas-exporters-india); [Razorpay GST export guide](https://razorpay.com/blog/gst-export-services-india-guide/)
- Invoices should state "Export of services – Zero rated supply under GST" and the LUT number (secondary source) — [Skydo](https://www.skydo.com/blog/export-of-services-under-gst)

### Inferences
- On a $5/month plan, Paddle's fee is about 15% ($0.75). Dodo's is about $0.70 (4% + 1.5% + 0.5% + $0.40, so roughly 14%). Razorpay's 3% + GST is about $0.18. For a low-price consumer app, MoR fees roughly double or triple the cost per sale, so annual plans or a higher monthly price soften the fixed fee.
- With an MoR, the founder's legal customer is the MoR, not 1,000 foreigners. The payout is then likely one foreign remittance from the MoR, which may simplify GST export proof. Whether the MoR payout is an "export of services" (to the MoR as recipient) needs a CA's confirmation.
- A practical shape: keep Razorpay for Indian customers in INR (with Indian GST charged), and use one MoR (Dodo or Paddle) for everyone outside India. This avoids registering for VAT in the EU, the UK and elsewhere.

### Gaps
- Whether Razorpay International supports PayPal as a wallet for foreign buyers, and Razorpay's exact activation documents (website policies, IEC, etc.). Not confirmed in this pass.
- FastSpring and Polar fees and India payout support were not researched (tool-call budget).
- Paddle INR payout support was not confirmed on Paddle's own page.
- Whether MoR payouts qualify for LUT zero-rating and what purpose code applies. Ask a CA.

## Regional / PPP pricing practice and suggested tiers

### Takeaway
Regional pricing is common. Published examples give 40–60% discounts for emerging markets. A purchasing-power-parity (PPP) multiplier puts India at about 0.3× US, so a 50% India discount is moderate, not full parity. The evidence is mostly vendor blogs.

### Cited Findings
- LeanStack reportedly gives 40–60% PPP discounts. Flight Levels Academy reportedly gives 40% off for India, Brazil, Thailand, South Africa and Mexico, and 60% in the lowest-income markets, based on IMF PPP data — [Fungies: PPP SaaS pricing 2026](https://fungies.io/purchasing-power-parity-saas-pricing-2026)
- An illustration takes US $99 to about $49 for India. One glossary puts India's PPP multiplier at about 0.3 — [Datadab](https://www.datadab.com/blog/purchasing-power-parity-saas/); [PricePush glossary](https://pricepush.app/glossary/purchasing-power-parity)
- Notion is described as offering regional discounts in India, with no figure given — [Fungies](https://fungies.io/ppp-pricing-saas-boost-global-revenue-2026)
- Dodo markets built-in PPP pricing — [Dodo PPP](https://dodopayments.com/billing/purchasing-power-parity)
- A 2026 guide covers PPP tiers with local currency and regional payment methods — [Beancount guide](https://beancount.io/blog/2026/09/19/saas-price-localization-ppp-tiers-local-currency-regional-payments-guide)

### Inferences (suggested starting tiers, not sourced benchmarks)
- Tier A (US, UK, Canada, Australia, Western/Northern EU, Gulf, Singapore): full price, e.g. $5–6/month or $40–50/year.
- Tier B (Southern/Eastern EU, Latin America upper-middle, Malaysia, China mainland if reachable): about 30–40% off.
- Tier C (India, Indonesia, Philippines, Vietnam, Pakistan, Bangladesh, Egypt, Nigeria): about 50–70% off. India stays priced in INR through Razorpay.
- Set the tier by billing country (card BIN or IP plus checkout country) to limit VPN abuse. MoR PPP tools do this.

### Gaps
- No primary-source benchmark for consumer education apps' regional prices (for example Duolingo or GoodNotes country prices) was collected.

## Tax for foreign customers: EU VAT OSS, UK VAT, US sales tax — and does an MoR remove it?

### Takeaway
A non-EU seller of electronically supplied services to EU consumers owes destination-country VAT and can use the non-Union OSS. Sources conflict on whether the €10,000 threshold applies to non-EU sellers; most say there is no threshold. The UK has no threshold for overseas digital sellers either: registration is due from the first UK consumer sale. US states tax SaaS unevenly, and economic nexus (usually $100k or 200 transactions) applies to foreign sellers too. An MoR takes over this collection and filing because it is the legal seller.

### Cited Findings
- Non-Union OSS lets a business with no EU establishment register in one member state and file one quarterly return for B2C services — [Flex Fulfillment glossary](https://www.flexfulfillment.eu/glossary-eu-vat-terms/); [Avalara: Union vs non-Union OSS](https://www.avalara.com/vatlive/en/vat-news/union-vs-non-union-oss-what-is-the-difference.html); [Malta MTCA](https://mtca.gov.mt/1/top-level-menu-bar/eservices/one-stop-shop-oss)
- Threshold conflict: one source says non-EU sellers charge destination VAT from the first sale, while another describes a €10,000 EU-wide threshold. Deloitte ties the €10,000 threshold to EU-established suppliers. Verify on the European Commission's pages — [Commenda](https://www.commenda.io/blog/ioss-and-oss-eu-vat-compliance-simplified-guide); [Deloitte Ireland](https://www.deloitte.com/ie/en/services/tax/research/itm-oss-are-you-ready.html)
- From 1 January 2025, online classes, livestreams and virtual events are treated as electronically supplied services. This matters for any live-tutoring feature — [SimplyVAT](https://simplyvat.com/?p=193)
- UK: an HMRC forum response says "there is no threshold to reach before the requirement to register for VAT in the UK" for overseas sellers of digital services to UK individuals. B2B sales fall under reverse charge — [HMRC community forum](https://community.hmrc.gov.uk/customerforums/vat/15f99cef-69c1-ee11-a81c-000d3a0d1900); [VATCalc](https://www.vatcalc.com/uk/uk-vat-on-foreign-digital-services/)
- US: most states use $100,000 or 200 transactions in 12 months for economic nexus (TX and CA use $500k, NY $500k plus 100 transactions). SaaS taxability varies by state: WA and TN tax it, while CO and FL are listed as not taxing it — [Stripe guide: US sales tax and economic nexus](https://stripe.com/gb/guides/introduction-to-us-sales-tax-and-economic-nexus); [Stripe: digital product tax](https://stripe.com/resources/more/digital-product-tax)
- MoR coverage: Paddle "collects the applicable tax, tracks filing deadlines, and submits sales tax returns and payments" — [Paddle pricing](https://www.paddle.com/pricing). Dodo includes "tax calculation, filing, and reporting across 190+ countries" — [Dodo pricing](https://dodopayments.com/pricing)

### Inferences
- With Razorpay International as the direct seller, NETZ would technically need to register for UK VAT from the first UK sale and for EU VAT through non-Union OSS (and similar regimes such as Australia, Japan and Norway). Sales below US state thresholds are unlikely to create US obligations at first. A solo founder can't realistically handle this, which is the main argument for an MoR outside India.
- An MoR does not remove Indian obligations: income tax on payouts, GST registration and treatment of the MoR payout, and FEMA realisation. A CA is still needed.

### Gaps
- Primary EU Commission and GOV.UK texts were not fetched. Other countries' digital-services VAT/GST regimes (Australia, Japan, Canada, Saudi Arabia and others) were not surveyed.

## Privacy rules for worldwide learners: GDPR, COPPA, UK Children's Code, India DPDP section 9, AdSense minors and CMP

### Takeaway
A learner app is "likely to be accessed by children", so the strictest regimes apply even if it is not aimed at kids. India's DPDP Act treats everyone under 18 as a child for all processing, not just ads. It requires verifiable parental consent and bans tracking, behavioural monitoring and targeted ads to children. These duties take effect around 13–14 May 2027. COPPA's amended rule has applied since 22 Apr 2026 for under-13 users in the US. AdSense does not handle minors automatically for third-party sites: the publisher must send the age signal (TFAT) and, for EEA/UK/CH traffic, run a Google-certified TCF CMP.

### Cited Findings
**India DPDP**
- Section 9 requires verifiable parental consent before processing a child's data, where a child is anyone under 18 (s.2(f)). It bars processing likely to harm a child's well-being and bars "tracking or behavioural monitoring of children or targeted advertising directed at children" — [AMLegals on s.9](https://amlegals.com/whatsapps-age-check-and-the-dpdp-act-what-section-9-means-for-childrens-data-compliance/); [Bar & Bench](https://www.barandbench.com/law-firms/view-point/childs-personal-data-and-privacy-analysing-the-draft-dpdp-rules-2025)
- The DPDP Rules were notified on 13 or 14 Nov 2025 (sources differ). Section 9 and Rule 10 (verifiable consent) take effect 18 months later, about 14 May 2027. The Board and Consent Manager provisions took effect immediately — [AMS Shardul regulatory alert](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/); [LKS](https://www.lkslaw.com/insights/articles/digital-personal-data-protection-rules-2025-incremental-tweaks-and-the-way-ahead)
- Under Rule 10, the parent must be an identifiable adult, verified through reliable identity details already held or a virtual token such as DigiLocker — [Sansa Legal](https://www.sansalegal.com/post/how-to-design-a-verifiable-parental-consent-process-under-the-dpdp-rules-2025)
- Rule 12 and the Fourth Schedule exempt certain classes from s.9(1) and 9(3), for example educational institutions, and certain purposes such as child safety. Commentary says the exemptions are narrow and tied to conditions. An ed-tech app that is not a school may not qualify — [dpdpa.com Rule 12](https://dpdpa.com/dpdparules/rule12.html)

**US COPPA**
- The amended COPPA Rule was published on 22 Apr 2025 and took effect on 23 Jun 2025. Compliance has been required since 22 Apr 2026, with a few subsection exceptions. It adds a standalone "mixed audience" definition: such services must age-screen before collecting personal information, then apply COPPA to users under 13 — [Federal Register 2025-05904](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule); [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/05/childrens-online-privacy-in-2025-the-amended-coppa-rule)
- On 25 Feb 2026 the FTC issued a policy statement limiting enforcement when children's data is collected only for age verification before parental consent — [Davis Polk](https://www.davispolk.com/index%2ephp/print/pdf/node/116375)

**UK Children's Code (Age Appropriate Design Code)**
- The code covers services "likely to be accessed by" children (under 18), not only child-directed ones. It reaches non-UK providers that offer services to UK users or monitor their behaviour. It has 15 standards — [ICO: services covered](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/services-covered-by-this-code/); [Clyde & Co](https://connectedworld.clydeco.com/post/102j4i9/the-childrens-code-an-internet-safety-and-privacy-code-of-practice)

**AdSense and minors: what is automatic vs. what the publisher must do**
- Tag for Age Treatment (TFAT, page dated 18 May 2026) "replaces the legacy tagForChildDirectedTreatment (TFCD) and tagForUnderAgeOfConsent (TFUA)". CHILD "functionally replaces TFCD/TFUA=True" and turns off personalised ads and remarketing. TEEN signals teen-specific protections. UNSPECIFIED is the default. Google applies the most conservative signal present — [AdSense help: TFAT](https://support.google.com/adsense/answer/17042704); [AdSense help 9009582](https://support.google.com/adsense/answer/9009582)
- Async AdSense code sets the age treatment per tag (data-tag-for-age-treatment, per search summary of AdSense help) — [AdSense help 9009582](https://support.google.com/adsense/answer/9009582)
- Google's own under-18 protections switch off ad personalisation and block sensitive ad categories (alcohol, gambling and similar) for accounts Google identifies as minors, including through ML age estimation rolled out in the US from mid-2025. The policy names YouTube, Google Display Ads and DV360 — [Google Ads policy: ad protections for children and teens](https://support.google.com/adspolicy/answer/15416897); [Ad-serving protections for teens](https://support.google.com/adspolicy/answer/12205906?hl=en); [PPC Land](https://ppc.land/google-begins-machine-learning-age-detection-for-ad-protections-in-us/)
- Certified CMP: since 16 Jan 2024 (EEA/UK) and 31 Jul 2024 (Switzerland), publishers need a Google-certified CMP integrated with IAB TCF to serve personalised ads. Google's certification checks TCF criteria only, not full GDPR compliance — [AdSense help 13554116](https://support.google.com/adsense/answer/13554116); [AdSense help 13554020](https://support.google.com/adsense/answer/13554020)

### Inferences
- The owner's claim that "AdSense handles minors' ad safety" is only partly true. Google's account-level protections apply only when Google itself knows or estimates that a signed-in user (or some US signed-out users) is a minor. A child on a shared or signed-out browser, or outside the regions where the ML rollout applies, gets normal treatment unless NETZ sends TFAT=CHILD/TEEN. NETZ knows the learner's age from its own sign-up, so the publisher must pass TFAT for under-18 accounts. For DPDP that means no targeted ads to anyone under 18 in India from May 2027.
- Simplest compliant design: ask for an age (date of birth) at sign-up. For under-18 users, use non-personalised or contextual ads only (TFAT=CHILD for under-13/16, TEEN for 13–17), turn off analytics profiling, and set high-privacy defaults. Get parental consent where required (India under 18; US under 13; EU under 13–16 depending on the member state; UK under 13 for information-society services). Alternatively, show no ads at all to minors.
- GDPR basics for a small app: a privacy notice, a lawful basis per purpose, consent for non-essential cookies and ad personalisation (through a certified CMP), a data-processing agreement with processors (Supabase, Google, MoR), handling user rights (access and deletion), and possibly an EU/UK representative (Art. 27) as a non-EU controller. A professional should advise.

### Gaps
- The exact age-of-digital-consent table per EU state and the UK's 13 were not re-verified here.
- Fourth Schedule exact wording (whether online learning platforms qualify) was not fetched. Needs a lawyer.
- Whether AdSense's own sensitive-category blocking applies on AdSense for Content (third-party sites) to signed-in teens. Google's policy text names Display Ads but does not clearly say AdSense for Content.

## AdSense RPMs for global education traffic by country tier

### Takeaway
No authoritative source exists. Blog estimates put US page RPM at about $15–20 across niches (education commonly $8–25), UK and other Tier-1 countries at about 0.7–0.9× US, and India at about 0.05–0.15× US (roughly $1–3). Tool-style app pages with few ad slots will earn less than content blogs.

### Cited Findings
- US: average CPC about $2.69 and estimated RPM $15–20 (not niche-specific) — [Rank1one](https://rank1one.com/top-10-countries-adsense-highest-earnings/)
- Education RPM range $8–25 (country unspecified) — [EcomCalcTools AdSense calculator 2026](https://ecomcalctools.com/publisher/adsense-earnings-calculator/)
- UK/Australia/Germany at 0.7–0.9× US. India at 0.05–0.15× US — [Ranktracker: RPM high vs low income regions](https://www.ranktracker.com/ko/blog/comparing-adsense-rpm-in-high-income-vs-low-income-regions/)
- India education/technology blog RPM of ₹165–415 per 1,000 views (about $2–5) — [Upgrowth](https://upgrowth.in/how-to-calculate-google-adsense-earnings-india/)
- Industry benchmarks for 2026 — [Weforads: ad revenue benchmarks 2026](https://weforads.com/blog/ad-revenue-benchmarks-2026/); [AdPushup state of ad revenue](https://www.adpushup.com/blog/state-of-ad-revenue/)

### Inferences
- Rough planning per 1,000 page views: US/UK/CA/AU about $5–15, EU about $3–8, India and SEA about $0.5–2. These are conservative because an app page has fewer ad slots than a blog, and non-personalised ads (for EU users without consent and for minors) earn noticeably less.
- Example: 100k monthly page views split 60% India, 20% SEA, 20% Tier-1 gives roughly $60 + $20 + $200, or about $280/month.

### Gaps
- No Google-published or audited RPM by country for education. No figure for how much non-personalised ads reduce RPM. Use the AdSense Countries report after launch.
