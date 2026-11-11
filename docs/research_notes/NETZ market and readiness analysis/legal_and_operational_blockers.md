# Legal, regulatory and operational blockers for launching NETZ (India, solo founder)

> Research date 2026-11-03 (two rounds, about 20 searches and fetches in total). Not legal advice. Items marked **[unverified]** come from background knowledge or a single weak source. A CA or lawyer should confirm them before anyone relies on them.

## 1. DPDP Act 2023 and DPDP Rules 2025: what a small edtech must do and by when

### Takeaway
The DPDP Rules were notified on 13 Nov 2025 (G.S.R. 846(E)) and come into force in three phases:
- **13 Nov 2025:** the institutional rules.
- **13 Nov 2026:** Rule 4 (consent managers).
- **13 May 2027:** almost everything a fiduciary must do, including notice, consent, security, breach notice, children's data (Section 9) and user rights.

The government said it would cut the 18-month window to 12 months, which would make 13 Nov 2026 the deadline. Searches up to today found **no notified amendment**. Some trackers still tie verifiable parental consent to Nov 2026, so build for compliance by **13 Nov 2026** to be safe. Section 9 is the biggest blocker for NETZ. It requires verifiable parental consent for anyone under 18 and bans tracking, behavioural monitoring and targeted ads to them. The penalty is up to ₹200 crore.

### Cited Findings
- **Notification and phases:** the Rules were notified as G.S.R. 846(E) on 13 Nov 2025.
  - Rules 1, 2 and 17–21 took effect on publication.
  - Rule 4 takes effect one year later.
  - Rules 3, 5–16, 22 and 23 take effect 18 months later.
  - That gives 13 Nov 2025, 13 Nov 2026 and 13 May 2027 — [India Briefing](https://india-briefing.com/news/india-dpdp-compliance-timeline-enforcement-2026-27-44740.html); [AZB & Partners](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
  - SCC Online cites G.S.R. 843(E) instead, so check the number against the Gazette — [SCC Online](https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/)
- **The Nov 2026 milestone:** sources disagree on what it covers. One says only consent managers (Rule 4). Another ties verifiable parental consent (s.6(9)) and the publication duty to Nov 2026. Commentators stress that Nov 2026 is not a universal compliance deadline — [India Briefing](https://india-briefing.com/news/india-dpdp-compliance-timeline-enforcement-2026-27-44740.html); [Cybersigma tracker](https://cybersigmacs.com/open/dpdp-compliance-timeline/); [Sansa Legal](https://www.sansalegal.com/post/how-to-comply-with-dpdpa-rules-before-the-november-2026-phase-2-deadline)
- **Proposed shortening:** the minister, Ashwini Vaishnaw, said the government would shorten the 18-month window — [Storyboard18](https://www.storyboard18.com/how-it-works/govt-to-shorten-dpdp-rules-18-month-compliance-timeline-ib-minister-ashwini-vaishnaw-84323.htm)
  - After a closed-door meeting on 22 Jan 2026, MeitY proposed 12 months, which would move the final date from 13 May 2027 to 13 Nov 2026. Industry pushed back — [Mondaq](https://www.mondaq.com/india/data-protection/1773554/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs); [SS Rana](https://ssrana.in/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs/); [GoTrust, 9 Feb 2026](https://www.gotrust.tech/newsletter/meity-may-cut-dpdp-compliance-timeline-from-18-to-12-months)
  - No search result showed a gazetted amendment.
- **Section 9(3)** bars tracking, behavioural monitoring and targeted advertising aimed at children. A "child" is anyone under 18 — [CyberPeace](https://cyberpeace.org/resources/blogs/prohibition-of-behavioral-tracking-and-targeted-advertising-for-children-under-the-dpdp-act-2023); [dpdpa.com s.9](https://dpdpa.com/dpdpa2023/chapter-2/section9.html)
- **Section 9 penalty:** breaching the children's obligations carries a penalty of up to ₹200 crore (Schedule) — [DPDP Wiki s.9](https://dpdp.myndsolution.com/wiki/act/section-9-processing-of-personal-data-of-children/); [AMLegals](https://amlegals.com/processing-of-personal-data-of-child-in-data-privacy-law-in-india/)
  - The ₹250 crore ceiling for failing to keep reasonable security safeguards was not confirmed in these results **[unverified]**.
- **CUTS warning:** a complete ban on behavioural monitoring could hit adaptive-learning platforms. That is directly relevant to personalised study features for minors — [CUTS](https://cuts-ccier.org/?p=28209)
- **Verifiable parental consent:** the fiduciary must check that the parent is an identifiable adult. The check can use data already held, details the parent volunteers, or a virtual token from an authorised entity such as DigiLocker — [AZB](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
- **Exemptions:** educational institutions (Fourth Schedule Part A), healthcare providers and crèches are exempt from parental consent and the tracking ban. The exemption covers only processing for their educational or welfare functions — [AZB](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/); [DPDP Wiki](https://dpdp.myndsolution.com/wiki/act/section-9-processing-of-personal-data-of-children/)
  - No Section 9(5) exemption notification has been found — [DPDP Wiki](https://dpdp.myndsolution.com/wiki/act/section-9-processing-of-personal-data-of-children/)
- **Breach notice:**
  - Tell the Board and each affected user "without delay".
  - Send the Board a detailed report within 72 hours.
  - The separate CERT-In incident report within 6 hours still applies.
  — [AZB](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
- **Retention:** keep personal data and logs for at least 1 year. The 3-year inactivity erasure rule covers only large platforms — [AZB](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
- **Consent managers** must be Indian companies that meet net-worth tests. NETZ is not required to use one — [AZB](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)

### Inferences
- **Blocker A, 17-year-old users:** NETZ is a private app, not an "educational institution" under the Fourth Schedule, so the exemption very likely does not apply. There are two options:
  - (a) Allow only users aged 18+, with a self-declared date of birth at sign-up. Cost: about ₹0.
  - (b) Build a parental-consent flow (parent email or phone OTP plus a declaration, or a DigiLocker token). Switch off personalised ads, analytics profiling and adaptive recommendations for minors. Cost: a few dev-days.
- **Must-do list (target 13 Nov 2026, legally needed by 13 May 2027 unless the timeline is compressed):**
  - an itemised privacy notice in plain language;
  - consent as easy to withdraw as it was to give;
  - a published grievance contact;
  - self-service deletion of the account and its data;
  - a breach runbook (Board, users, CERT-In within 6 h);
  - processor contracts with Supabase, the host, Razorpay and the ad network;
  - encryption and access logs, with logs kept for 1 year.
- **Cost:** about ₹0 if self-drafted. A lawyer reviewing the privacy policy, terms and children's flow would cost roughly ₹15k–₹60k **[estimate, no source]**.

### Gaps
- Whether a gazetted amendment has compressed the timeline. None was found as of 3 Nov 2026; check the MeitY or eGazette site directly.
- The age-assurance standard needed when a user self-declares as 18+.

## 2. Payments: Razorpay onboarding, refunds, digital goods, e-mandates

### Takeaway
An individual can onboard to Razorpay as a sole proprietor with a personal PAN, an address proof, bank proof and video KYC. Since 1 Jan 2026 the website policy pages are no longer checked at onboarding. NETZ should still publish Terms, Privacy, Refund and Contact pages and visible pricing, because consumer and DPDP law still require them.

Recurring payments fall under the RBI Digital Payments – E-mandate Framework 2026 (21 Apr 2026):
- The first debit needs AFA.
- Later debits up to ₹15,000 need no AFA.
- A pre-debit notice must go out at least 24 h before each debit.

The CCPA Dark Patterns Guidelines 2023 ban "subscription traps" (hard-to-cancel subscriptions). A blanket "no refunds" clause is risky; consumer forums have ordered edtech refunds.

### Cited Findings
- **Sole proprietor KYC:** personal PAN, an address proof (Aadhaar, Voter ID or Passport), bank proof. Older guidance also asks for a website with terms, privacy and refund policies and SSL — [Razorpay blog](https://razorpay.com/blog/documents-required-for-payment-gateway)
- **Website policies at onboarding:** Razorpay's FAQ lists Terms, Refund and Privacy pages as "removed requirements" under the Master KYC changes effective 1 Jan 2026. Video KYC is used when CKYC data is not available — [Razorpay docs FAQ](https://razorpay.com/docs/payments/faqs.md)
- **E-mandate Framework 2026 (21 Apr 2026):**
  - The first transaction needs AFA.
  - Later recurring debits up to ₹15,000 per transaction need no AFA.
  - The issuer must send a pre-debit notice at least 24 h before the debit. It must show the merchant, amount, date and time, mandate reference and reason.
  - Circular RBI/CO.DPSS.POLC.No.S56/02.14.003/2026-27.
  — [SCC Online](https://www.scconline.com/blog/post/2026/04/24/rbi-issues-digital-payments-e-mandate-framework-2026/); [MediaNama](https://www.medianama.com/2026/04/223-rbi-additional-factor-authentication-e-mandates/); [K&S](https://ksandk.com/newsletter/rbi-e-mandate-framework/)
- **Dark Patterns Guidelines 2023:** issued by the CCPA under Section 18 of the CPA 2019. They list 13 prohibited patterns, including subscription trap, false urgency, drip pricing and forced action — [Bar & Bench](https://www.barandbench.com/law-firms/view-point/from-nudge-to-notice-what-indias-dark-pattern-orders-mean-for-digital-business); [JSA](https://www.jsalaw.com/newsletters-and-updates/ccpa-issues-guidelines-for-prevention-and-regulation-of-dark-patterns-2023/)
  - A subscription trap is making cancellation impossible or cumbersome, or forcing users on a free tier to give payment details for auto-debit. Having no in-app cancel option is given as an example — [Nishith Desai](https://nishithdesai.com/research-and-articles/hotline/technology-law-analysis/dark-patterns-decoded-indias-legal-and-regulatory-guide-15590)
  - A CCPA advisory in June 2025 told platforms to self-audit within 3 months; it went to more than 50 platforms — [Bar & Bench](https://www.barandbench.com/law-firms/view-point/from-nudge-to-notice-what-indias-dark-pattern-orders-mean-for-digital-business); [Storyboard18](https://www.storyboard18.com/amp/how-it-works/ccpa-dark-patterns-warning-advisory-goes-out-to-streamers-fintechs-in-addition-to-e-commerce-firms-69331.htm)
  - A consumer commission reportedly ordered a learning app to refund ₹65,000 plus compensation. This comes from a single, poorly cited item, so treat it as anecdotal — [Singhania](https://singhania.in/blog/dark-patterns-in-india)
- **Virtual currency, industry pattern:** other processors restrict virtual currency that can be resold or converted. The usual carve-out is in-game currency sold by the operator of the game itself — [Payrexx](https://docs.payrexx.com/merchant/english/account-verification/prohibited-business-models); [Zoho Payments](https://www.zoho.com/us/payments/prohibited-restricted-businesses.html)
  - Razorpay's own list was **not found**.

### Inferences
- **No company is needed** to accept payments.
- **Gems:** NETZ is the operator issuing its own closed-loop gems, which fits the common carve-out. Describe them to Razorpay as "in-app cosmetic digital items".
- **Refund policy:** replace "no refunds" with wording like: "No refunds for change of mind. Refunds for double charges, failed or undelivered service, or technical faults within X days."
- **Cancellation and renewal:** add one-click in-app cancellation and show the auto-renew terms before checkout. Razorpay Subscriptions handles AFA and pre-debit notices. Keep plans under ₹15,000.
- **[unverified]** Consumer Protection (E-Commerce) Rules 2020 require refund, return and cancellation terms to be shown clearly. Not re-checked.

### Gaps
- Razorpay's prohibited and restricted business list (page not retrieved).
- Case law on whether a blanket "no refund" clause is an "unfair contract" under Section 2(46) of the CPA 2019.
- Razorpay's fees (~2% + GST) and onboarding time **[unverified]**.

## 3. Tax and business structure

### Takeaway
**GST:**
- Foreign OIDAR suppliers must register at any turnover.
- For an Indian supplier of inter-state services, IGST Notification 10/2017 exempts registration until all-India turnover passes **₹20 lakh** (₹10 lakh in some special-category states).
- NETZ can therefore start unregistered and register at the threshold. The rate is 18%.
- Some secondary sources say "register from day one", which conflicts with this. A CA should confirm before launch.

**Income tax:** the **Income-tax Act 2025 applies from 1 Apr 2026**. Section 58 now holds the presumptive schemes, including 6% of digital receipts for business. A proprietorship cannot get DPIIT recognition.

### Cited Findings
- **IGST Notification 10/2017** (issued under Section 23(2) of the CGST Act) exempts people making inter-state supplies of taxable services from registration if all-India aggregate turnover is ₹20 lakh or less — [GSTZen](https://gstzen.in/a/integrated-tax-notification-102017-seeks-to-exempt-persons-making-inter-state-supplies-of-taxable-services-from-registration-under-section-232.html); [StudyCafe](https://studycafe.in/inter-state-taxable-service-providers-exempt-obtaining-registration-us-232-14378.html)
  - Sources disagree on the issue date (13 Oct or 15 Nov 2017).
  - Thresholds for Arunachal Pradesh, Assam, Himachal Pradesh, Meghalaya, Sikkim and Uttarakhand were raised from ₹10 lakh to ₹20 lakh from 1 Feb 2019 — [GSTZen](https://gstzen.in/a/integrated-tax-notification-102017-seeks-to-exempt-persons-making-inter-state-supplies-of-taxable-services-from-registration-under-section-232.html)
- **OIDAR:** foreign suppliers must register under Section 24(xi) with no threshold. Online education counts as OIDAR — [Fonoa](https://www.fonoa.com/resources/country-tax-guides/india/tax-on-digital-services)
  - For Indian OIDAR providers, India Briefing says the ₹20 lakh threshold applies — [India Briefing](https://www.india-briefing.com/news/oidar-compliance-india-gst-registration-ntor-gstr5a-digital-tax-43951.html/)
  - ClearTax says registration is mandatory irrespective of turnover — [ClearTax](https://cleartax.in/s/oidar-gst-registration)
  - The two sources conflict.
- **Courses:** 18% GST; one guide advises registering from day one — [Disytax](https://disytax.com/?p=24958)
- **Income-tax Act 2025:** effective 1 Apr 2026. Section 58 consolidates the old 44AD, 44ADA and 44AE schemes — [Income Tax Dept](https://www.incometaxindia.gov.in/w/section-58-144); [TaxGuru](https://taxguru.in/income-tax/analysis-presumptive-taxation-section-58-income-tax-act-2025.html)
  - Business receipts: 6% presumptive on banking or digital receipts, 8% on the rest.
  - Turnover limit: ₹2 crore, or ₹3 crore if cash receipts are 5% or less.
  - These come from secondary sources, which disagree on how professionals are treated — [TaxGuru](https://taxguru.in/income-tax/analysis-presumptive-taxation-section-58-income-tax-act-2025.html); [TheTaxCorp](https://thetaxcorp.in/article/section-58-presumptive-scheme-under-income-tax-act-2025-integrated-rules-for)
- **DPIIT:** only Pvt Ltd companies, LLPs and registered partnerships are eligible; sole proprietorships are not — [SetIndiaBiz](https://www.setindiabiz.com/blog/dpiit-startup-recognition-eligibility-criteria-guide); [IncorpX](https://www.incorpx.io/blog/dpiit-startup-recognition-2026-eligibility)
  - A proprietorship that later converts can get recognition counted from the date it started, per a 30.06.2021 office memorandum — [Khurana & Khurana](https://www.khuranaandkhurana.com/dpiit-startup-registration-online)
  - Recognition is free.

### Inferences
- **Selling only to consumers:** NETZ sells its own service to consumers, so it is not an e-commerce operator and TCS (Sec 52) and TDS 194-O do not apply (inference).
- **AdSense income:** it is paid from abroad, so it is probably an export of services, which is zero-rated once registered **[unverified]**.
- **Structure:** start as a sole proprietor with Udyam (free) and use Section 58 presumptive tax. Move to an LLP or Pvt Ltd for DPIIT, liability protection or funding. Set-up costs are roughly ₹8k–25k plus annual compliance **[estimate]**.

### Gaps
- An authoritative CBIC ruling on whether domestic OIDAR suppliers have a threshold.
- The final enacted text of Section 58.

## 4. Ads: AdSense with under-18 users, ASCI, personalised ads under DPDP

### Takeaway
Google's own teen policy (in force since 15 Aug 2022) switches off ad personalisation for signed-in Google users under 18, with no action needed from the publisher. That only covers users Google knows to be teens. DPDP Section 9(3) puts the duty on NETZ, which knows the user's age. NETZ must send **non-personalised ad requests** for minor accounts (e.g. `npa=1` or AdSense's non-personalised setting), or show them no ads.

### Cited Findings
- **AdSense teen protections:** they apply to Google Accounts of users under 18. Ads personalisation is disabled and sensitive ad categories are blocked. The page says publishers need take no action. Enforcement began 15 Aug 2022 — [AdSense Help 12290846](https://support.Google.com/adsense/answer/12290846)
- **Google tags:** publishers can append `tfua=1` (EEA users under the age of consent) or `npa=1` to an ad request to force non-personalised ads. These come from Google IMA SDK docs — [Google IMA consent docs](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/consent)
- **Sites aimed at under-13s:** these should serve only non-personalised ads. This comes from a third-party summary — [ConductAtlas](https://conductatlas.com/platform/google-ads/google-adsense-program-policies/child-directed-content-restrictions/)

### Inferences
- Make the paid tier ad-free, and show free-tier minors non-personalised ads only. Adults need a consent banner for personalised ads.
- ASCI's code covers NETZ's own marketing claims, e.g. "improves marks" **[unverified, not searched]**.

### Gaps
- The exact AdSense web setting for per-request non-personalised ads (AdSense for web as opposed to IMA).
- ASCI edtech guidelines.

## 5. Licensing of ML datasets and models

### Takeaway
**This is a real commercial blocker.**
- **BRUSH:** explicitly non-commercial research only.
- **DeepWriting:** derived from IAM-OnDB, which is non-commercial research only.
- **CoMER:** the GitHub repository has **no licence file** and was archived on 13 Feb 2026. With no licence, the default is "all rights reserved", so its code and checkpoint have no grant for commercial use.
- **CROHME:** no licence is stated.

Shipping models trained on these in a paid product needs commercial permission, or retraining on data that allows commercial use.

### Cited Findings
- **BRUSH:** "may only be used for non-commercial research purposes". For other uses, contact Prof. James Tompkin (Brown). The code is under a separate Brown licence that also bars commercial use — [GitHub brownvc/decoupled-style-descriptors](https://github.com/brownvc/decoupled-style-descriptors); [Papers with Code](https://paperswithcode.com/dataset/brush)
- **IAM-OnDB:** "non-commercial research purpose only" — [FKI/IAM](https://fki.tic.heia-fr.ch/databases/iam-on-line-handwriting-database)
- **DeepWriting:** derived from IAM-OnDB — [arXiv 2603.02805](https://arxiv.org/pdf/2603.02805). Its licence is listed only as "Other" — [hyper.ai](https://hyper.ai/datasets/20846)
- **CoMER repository:**
  - no LICENSE file is shown;
  - the README mentions a bundled `data.zip` (CROHME) and a trained checkpoint, neither with stated terms;
  - archived on 13 Feb 2026.
  — [GitHub Green-Wood/CoMER](https://github.com/Green-Wood/CoMER)
- **CROHME:** the data page states no licence — [CROHME, ISI Kolkata](https://www.isical.ac.in/~crohme/CROHME_data.html)

### Inferences
- **Which HMER model:** the owner's frozen HMER model needs to be traced to its architecture repository and training data. If it uses CoMER code or weights, there is no licence grant at all.
- **Options:**
  1. Email Tompkin (BRUSH), the ETH AIT lab (DeepWriting), the FKI/IAM maintainers and the CoMER authors to ask for commercial permission.
  2. Retrain on data with permissive licences or on synthetic data. User data collected with opt-in consent is another source, but it brings DPDP duties.
  3. A re-implementation of the architecture written from the paper avoids the code-copyright issue, but not the training-data terms.
- **Legal position:** whether trained weights count as a "derivative" is unsettled in law, but the stated terms are clear. A lawyer should look at this if NETZ keeps these models.
- **Other assets:** run a licence scan on fonts, icons and npm packages and keep a THIRD_PARTY_NOTICES file. Watch for GPL/AGPL code and fonts licensed for "personal use only" (inference).

### Gaps
- DeepWriting's own licence text, and the HME100K terms (widely reported as research-only **[unverified]**).

## 6. Gems, rewards and online gaming law

### Takeaway
The **Promotion and Regulation of Online Gaming Act 2025** (Act 32 of 2025, assented on 22 Aug 2025) and the **Online Gaming Rules 2026** have been **in force since 1 May 2026**:
- online money games are banned, with criminal penalties;
- "online social games" (no money stakes; subscription or access fees allowed) are promoted.

NETZ's study tasks, streaks and medals are not a money game. They involve no stake and no winnings, and gems are bought only for cosmetic items. The risk only arises if gems can be won through chance, staked, transferred, or cashed out.

### Cited Findings
- **Commencement:** the Act and Rules started on 1 May 2026, under gazette notifications of 22 Apr 2026 — [Mondaq/Legal500](https://www.legal500.com/intelligence/india/media-telecoms-it-entertainment/statutory-update-new-legal-framework-for-online-gaming-from-1st-may-2026); [PIB doc](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/apr/doc2026430859401.pdf)
- **Chapter V:** its criminal penalties are in effect, and "there is effectively no formal compliance window" — [Legal500](https://www.legal500.com/intelligence/india/media-telecoms-it-entertainment/statutory-update-new-legal-framework-for-online-gaming-from-1st-may-2026)
- **Online social game:** a game that involves no staking of money or "other stakes". Subscription or access fees are allowed if they are not wagers — [Mondaq](https://webiis10.mondaq.com/india/social-media/1785870/the-promotion-and-regulation-of-online-gaming-act-2025-and-the-promotion-and-regulation-of-online-gaming-rules-2026); [SCC Online](https://www.scconline.com/blog/?p=357658)
  - "Other stakes" is a key term in all three definitions (e-sport, online money game, online social game) — [Cyril Amarchand](https://corporate.cyrilamarchandblogs.com/2025/10/online-gaming-gets-played-but-ready-to-play-ball/)

### Inferences
- The terms of service should say gems have no monetary value and are non-transferable, non-redeemable and non-refundable.
- Product rules: no paid loot boxes or random rewards bought with gems, and no contests where a paid entry wins a prize.
- NETZ is a study tool rather than a game, so it probably does not have to register as a social game, but this was not confirmed.

### Gaps
- Whether "other stakes" could include purchased virtual items.
- Whether registration of online social games is optional or mandatory under the 2026 Rules.

## 7. Hosting, cookies, accessibility, trademark "NETZ"

### Takeaway
- **Trademark:** an aggregator search found no Indian Class 41 filing for "NETZ", but this is **not** an official clearance. Run the IP India public search in Classes 9, 41 and 42.
- **Trademark fee:** about ₹4,500 per class for an individual with Udyam, MSME or startup status, against ₹9,000 for others (consultancy source).
- **Hosting and cookies:** under DPDP, cross-border transfer uses a negative list, so hosting outside India is allowed. Non-essential cookies and ad tracking need consent **[unverified, not searched this round]**.

### Cited Findings
- **Trademark search:** no "Netz" Class 41 record appeared. Nearby Class 41 marks were found, such as NET POSITIVE (filed Apr 2026) and NDEX. Aggregator pages are not legal records. App brands usually file in Classes 41, 42 and 9 (e.g. BYJU'S) — [RegisterKaro](https://www.registerkaro.in/trademark-search/net-positive-7904102); [Kanakkupillai](https://www.kanakkupillai.com/learn/trademark-registration-for-edtech-and-online-coaching-platforms/)
- **Fee:** ₹4,500 per class for startups or MSMEs (via Udyam or DPIIT), against ₹9,000 for others — [RegisterKaro](https://www.registerkaro.in/post/trademark-registration-for-msmes-and-startups)

### Inferences
- File TM-A for "NETZ" (word mark) in Classes 9, 41 and 42 after getting Udyam: about ₹13.5k in government fees, plus an agent if one is used.
- **CERT-In 2022 Directions:** report incidents within 6 h and keep logs for 180 days in India **[unverified]**.
- **Accessibility:** the RPwD Act and the Supreme Court's *Rajive Raturi* (2024) judgment raise expectations. Aim for WCAG 2.1 AA; this is not a hard launch blocker **[unverified]**.

### Gaps
- An official IP India search for "NETZ" in Classes 9 and 42, and any phonetic matches.
- The CERT-In log-localisation scope for small SaaS.

## Summary blocker table (for report writer)

| # | Blocker | Severity | Required | Cost | Timeline |
|---|---|---|---|---|---|
| 1 | ML licences (BRUSH, DeepWriting/IAM non-commercial; CoMER no licence; CROHME unstated) | **High** | Commercial permission, or retrain on permissively licensed data; trace the HMER model's origin | ₹0 to unknown; weeks | Before paid launch |
| 2 | Under-18 users (DPDP s.9: parental consent, no tracking or targeted ads; up to ₹200 cr) | **High** | 18+ gate, or a parental-consent flow plus non-personalised everything for minors | ₹0 to a few dev-days | Legally by 13 May 2027; plan for 13 Nov 2026 |
| 3 | DPDP core compliance | High | Notice, consent, grievance contact, deletion, breach runbook (72 h Board, 6 h CERT-In), DPAs | ₹0–60k legal review | As above |
| 4 | Dark patterns and "no refunds" | Medium–High | In-app cancellation, clear auto-renew terms, a refund policy with exceptions | ₹0 | Before launch |
| 5 | GST | Medium | Register at ₹20 lakh all-India turnover (IGST Notif. 10/2017); 18%; CA to confirm the OIDAR view | CA fees | When nearing threshold; confirm before launch |
| 6 | Razorpay | Medium | PAN, Aadhaar, bank, video KYC; publish policy pages; describe gems as cosmetic digital items | ~2% per transaction [unverified] | Days |
| 7 | E-mandate | Low–Medium | First debit with AFA; under ₹15k later debits; 24 h pre-debit notice (handled by Razorpay) | ₹0 | Already in force (Apr 2026) |
| 8 | Trademark "NETZ" | Medium | Official IP India search; file in Classes 9, 41 and 42 | ~₹4.5k per class with Udyam | Search now; registration in months to years |
| 9 | Ads | Medium | Non-personalised ads for minors; consent banner for adults; ad-free paid tier | ₹0 | Before ads go live |
| 10 | Online Gaming Act (in force since 1 May 2026) | Low if closed-loop | No stakes, chance, cash-out or transfer for gems | ₹0 | Before launch |
| 11 | Structure and tax | Low | Proprietorship plus Udyam; Section 58 presumptive tax (IT Act 2025); LLP or Pvt Ltd later for DPIIT | ₹0 now | Later |
