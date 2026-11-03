# SEO + AI-citation playbook for NETZ maths method / solver pages (Google + AI assistants), researched 2026-11-03

Legend: **[fetched]** = primary page read this session. **[search summary]** = taken from search-result snippets or secondary write-ups, not checked against the primary source. **[prior knowledge, not refetched]** = from the researcher's background knowledge (cutoff mid-2026), with the canonical URL given but not reloaded today. Treat the last two as needing a quick check before quoting.

## 1. Structured data: what Google still supports (MathSolver, FAQPage, HowTo, LearningResource, Practice problems, Quiz, Breadcrumb)

### Takeaway
MathSolver structured data still has a live Google doc with no deprecation banner. It is a **site-level** feature: the markup goes on the home page, and Google needs a solver that takes a user's expression through a URL template. FAQ, HowTo and Practice-problem rich results are all gone as of 2026. BreadcrumbList is still documented. Structured data is no longer a growth lever for individual method pages beyond Breadcrumb, MathSolver on the home page, and valid but non-rich-result schema.

### Cited Findings
- **MathSolver is current:** the doc has no deprecation or sunset notice and presents the markup as live. It has no last-updated date. — [Google: Math solver structured data](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **MathSolver eligibility:**
  - Add the `MathSolver` markup to the site's **home page**.
  - Use canonical URLs for identical copies of the solver hosted at different URLs.
  - The solver can't be entirely hidden behind a login or paywall. The solution and step-by-step walkthrough for the user's first problem must be accessible, though extra content can be gated.
  - Promotional or affiliate pages disguised as solvers are not allowed.
  - Solvers with inaccurate solutions or wrong problem-type support may be removed from the feature until fixed.
  - Source: [Google: Math solver structured data](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **MathSolver required properties:** `potentialAction` (type `SolveMathAction`), `potentialAction.mathExpression-input`, `potentialAction.target` (a URL template), `url`, and `usageInfo` (a URL to the privacy policy). — [same doc](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **MathSolver recommended properties:** `inLanguage`, `assesses` (use with HowTo markup) and `potentialAction.eduQuestionType`. The type must also be `LearningResource` with `learningResourceType` set to "Math Solver" (the examples write "Math solver"). — [same doc](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **What Google sends to the solver:** `mathExpression-input` can be LaTeX, AsciiMath or keyboard-typed maths. Derivatives, integrals and limits come in special forms, for example `\int_{from}^{to} expr` and `\lim_{x\rightarrow a} expr`. — [same doc](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **eduQuestionType values** include Algebra, Calculus, Derivative, Differential Equation, Eigenvalue, Eigenvector, Integral, Limit, Linear Algebra, Linear Equation, Matrix, Polynomial Equation, Quadratic Equation, Statistics, System of Equations and Trigonometry. The doc says the list isn't exhaustive. There is no "numerical methods" or "root finding" value. — [same doc](https://developers.google.com/search/docs/appearance/structured-data/math-solvers) [fetched]
- **June 2025:** Google announced it would phase out seven types: Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement and Vehicle Listing. Its reason was that they were not commonly used and no longer added significant value. — [Google Search Central blog, "Simplifying the search results page", Jun 2025](https://developers.google.com/search/blog/2025/06/simplifying-search-results) [search summary]
- **Deprecation timeline (article published 2 Jul 2026, updated 18 Jul 2026):**
  - FAQ rich results were limited to government and health sites in Aug 2023.
  - HowTo was fully removed on 14 Sep 2023.
  - The sitelinks search box was retired in Nov 2024.
  - Six of the June 2025 types were dropped from Search Console and the Rich Results Test on 9 Sep 2025.
  - **Practice Problem** got a deprecation notice in Nov 2025 and was removed from Search Console, the Rich Results Test and the filters on **6 Jan 2026**.
  - **FAQ rich results were fully removed on 7 May 2026**, including for government and health sites. Quoted changelog line: "This feature will no longer appear in Google Search starting May 7, 2026." The FAQPage doc now redirects to the changelog (15 Jun 2026).
  - Google says these removals don't affect ranking.
  - Source: [Patrick Stox, Schema & Rich Result Deprecations timeline](https://patrickstox.com/technical-seo/on-page/structured-data/schema-deprecations/) [fetched; secondary, but quotes the Google changelog]
- **Practice problem coverage elsewhere:** the deprecation was reported as part of Google's work to simplify results, attributed to John Mueller. — [Search Engine Journal](https://www.searchenginejournal.com/google-deprecates-practice-problem-structured-data-in-search/560076/); [PPC Land](https://ppc.land/google-phases-out-practice-problem-and-dataset-structured-data/) [search summary]
- **No special markup for AI features:** Google says there is no special schema.org structured data needed to appear in AI Overviews or AI Mode. It also says structured data should match the visible text. — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) [fetched]

### Inferences
- **Per-page JSON-LD template:**
  - `BreadcrumbList`, which is still documented. Mobile breadcrumb display in the SERP was reportedly reduced in Jan 2025, which is unverified this session.
  - `WebPage` or `LearningResource` with `name`, `description`, `author`, `dateModified`, `inLanguage`, `educationalLevel` and `teaches`, used as plain schema that helps machines understand the page, not to win a rich result.
  - An optional `SoftwareApplication` or `WebApplication` entry for the calculator.
- **Don't spend effort on FAQPage, HowTo or Quiz/Practice markup.** It no longer produces rich results. A visible FAQ section can still help users and AI extraction as plain HTML.
- **MathSolver is worth adding on the NETZ home page only if** NETZ exposes a URL template such as `/solve?q={math_expression}` that renders the solution and steps server-side without a login. It mainly matches algebra and calculus query types (Integral, Derivative, Matrix, Eigenvalue, System of Equations). Numerical-method pages such as Newton-Raphson have no matching eduQuestionType. This feature is a separate product decision.

### Gaps
- No first-party Google statement on the current status of the "Education Q&A" / Quiz (flashcard) rich result was found this session.
- The Jan 2025 mobile breadcrumb change was not verified this session.
- The MathSolver doc has no "last updated" date, so it is unclear whether Google still actively shows the math solver feature in SERPs or only keeps the doc up.

## 2. What top-ranking calculator pages have in common ("newton raphson method calculator", "integral calculator", "gst calculator", "matrix calculator")

### Takeaway
A clean SERP sample couldn't be collected this session. The search tool returned mostly spam or mirror domains for "newton raphson method calculator", with PlanetCalc as the only real result. This question remains largely a gap and needs a manual SERP check (incognito, google.co.in) by the owner or another researcher.

### Cited Findings
- The top result surfaced for "newton raphson method calculator" was PlanetCalc's Newton's method calculator. It describes Newton's method as also known as Newton-Raphson. A sibling PlanetCalc page shows Newton-Raphson iterations and works out the derivative symbolically, so users don't enter f′(x). — [PlanetCalc Newton's method](https://planetcalc.com/7748/); [PlanetCalc Newton-Raphson iterations](https://planetcalc.com/7999) [search summary]
- Many other results were repeated "Newton Raphson Method Calculator" pages with machine-generated filler on unrelated hijacked domains. This is evidence that the query attracts spam competition. — search results for the query, 2026-11-03 [search summary]
- Ahrefs advises auditing pages that win AI Overview citations and noting format patterns such as **definitions, statistics, step-by-steps and video embeds**. — [Ahrefs, Mar 2026](https://ahrefs.com/blog/ai-overview-citations-top-10/) [fetched]

### Inferences
- **Common pattern of known category leaders** (prior knowledge, not verified this session):
  - Examples: Symbolab, Wolfram|Alpha, Mathway, eMathHelp, atozmath, Omni Calculator, ClearTax and Groww for GST.
  - The tool sits above the fold.
  - The H1 is the exact query phrase plus "Calculator".
  - A worked example sits below the tool.
  - Some have an iteration table or output table.
  - An explanatory section ("What is…", formula, steps) follows, with a short FAQ.
  - Omni and ClearTax-style pages run roughly 800–2,000 words.
- **NETZ's iteration tables and step-by-step output fit this pattern** and should be server-rendered with a default worked example.

### Gaps
- A real SERP sample for all four queries is missing: title formats, word counts, video presence, Core Web Vitals.
- No 2025–2026 study specific to calculator SERPs was found.

## 3. AI-citation / GEO factors (Princeton GEO, Ahrefs/BrightEdge, Bing for ChatGPT, freshness, llms.txt)

### Takeaway
Ranking well in classic search still helps, but AI Overviews now cite far more pages outside the top 10 (about 62% in Ahrefs' March 2026 data) because of query fan-out. To be cited, a page should:
- cover the topic and its subtopics broadly (fan-out queries);
- contain extractable definitions, steps, numbers and sources;
- be fresh;
- be indexable by Bing as well as Google (ChatGPT and Copilot).

llms.txt has no confirmed use by any major AI search system.

### Cited Findings
- **Ahrefs, Mar 2026** (863K keyword SERPs, about 4M AIO URLs):
  - 37.9% of AI Overview citations also appeared in the top 10 SERP blocks.
  - 31.2% ranked in positions 11–100 and 31.0% beyond 100.
  - The July 2025 study had found about 76% from the top 10, but Ahrefs says the two numbers aren't directly comparable because its parsing changed.
  - YouTube made up 5.6% of all AIO-cited URLs and was the most-cited AIO domain.
  - AIOs were powered by Gemini 3 as of Jan 2026.
  - Source: [Ahrefs: 38% of AI Overview citations pull from the top 10](https://ahrefs.com/blog/ai-overview-citations-top-10/) [fetched]
- **BrightEdge** reported about 17% top-10 overlap in Feb 2026, using a different method. — via [DesignRush summary](https://news.designrush.com/ai-overview-citations-drop-ahrefs) [search summary]
- **Ahrefs, assistants:** only about 12% of URLs cited by AI assistants (ChatGPT, Perplexity, etc.) rank in Google's top 10 for the original prompt. — [Ahrefs: AI search overlap](https://ahrefs.com/blog/ai-search-overlap/) [search summary]
- **ChatGPT and Bing:** estimates of overlap between ChatGPT citations and Bing range from about 8% to about 87% depending on method. Some 2026 secondary sources claim ChatGPT moved from Bing-only retrieval to a hybrid index. A case study reports a site losing ChatGPT citations after Bing deindexed it. All of this is unverified against OpenAI. — [Something Inc case study](https://somethinginc.com/blog/bing-deindex-chatgpt-citations-case-study/) [search summary; low confidence]
- **Freshness:** a secondary summary of Ahrefs' 17M-citation study says AI assistants cite content about 25–33% fresher than Google's organic results. — [AuthorityTech summary](https://authoritytech.io/curated/ahrefs-content-freshness-ai-citation-platform-refresh-2026.md) [search summary; not confirmed against Ahrefs' original]
- **Google on AI Overviews and AI Mode:**
  - They use **query fan-out**, issuing multiple related searches across subtopics.
  - The only eligibility requirement is being indexed and eligible to show with a snippet.
  - No special AI text files or markup are needed.
  - AIO and AI Mode traffic is counted in Search Console under the "Web" search type.
  - Clicks from AIO pages "tend to be higher quality".
  - Source: [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) [fetched]
- **Princeton GEO paper** (Aggarwal et al., "GEO: Generative Engine Optimization", KDD 2024):
  - Adding **cited sources, quotations and statistics** raised visibility in generative-engine answers by up to about 40%.
  - Keyword stuffing didn't help.
  - Gains were larger for lower-ranked sources.
  - Source: [arXiv 2311.09735](https://arxiv.org/abs/2311.09735) [prior knowledge, not refetched; 2023/2024 paper, older than the preferred window]
- **llms.txt:**
  - Google says it doesn't need special AI text files, and that llms.txt has no positive or negative effect.
  - Vendor log analyses (500M+ bot events) report that GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and Google-Extended almost never request /llms.txt.
  - One analysis found 97% of llms.txt files got zero AI requests.
  - No official 2026 statement was found from OpenAI, Anthropic or Google saying their production crawlers use third-party llms.txt files.
  - Sources: [Google AI features doc](https://developers.google.com/search/docs/appearance/ai-features) [fetched]; [PPC Land: llms.txt adoption up 8.8x but 97% get zero AI requests](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/) [search summary]

### Inferences
- **Per-page content template that favours extraction:**
  - A one-sentence definition in the first 100 words ("The Newton–Raphson method is…").
  - The formula in text and MathML or KaTeX, not as an image.
  - Numbered algorithm steps.
  - A fully worked example with a real iteration table of numbers.
  - A convergence or error statement with numbers, for example quadratic convergence and the number of iterations needed for tolerance 1e-6.
  - A comparison against sibling methods (bisection, secant).
  - A "common mistakes" section.
  - References to textbooks, such as Burden & Faires or the NCERT syllabus.
  - A visible "last reviewed" date.
- **Each section should answer a likely fan-out sub-query** ("newton raphson formula", "newton raphson example", "newton raphson vs bisection", "when newton raphson fails").
- **Short YouTube explainers** for flagship methods may win AIO citations, since YouTube is the most-cited AIO domain.
- **Skip llms.txt, or add it only as a near-zero-cost extra.** Don't count on it.

### Gaps
- No primary OpenAI statement on whether ChatGPT search still relies on Bing in 2026.
- No study found specifically on maths or education queries in AI Overviews.

## 4. AI crawlers: user agents, purpose, robots.txt, JavaScript

### Takeaway
Allow the **search and retrieval bots** if pages should be cited in answers: Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User and Applebot. The **training bots** (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended) can be blocked separately without losing search visibility. That choice is the owner's. Most AI crawlers **do not run JavaScript**, so method content must be in the server HTML.

### Cited Findings
- **OpenAI:**
  - **OAI-SearchBot** powers ChatGPT search. "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers." OpenAI recommends allowing it in robots.txt. Changes take about 24 hours to apply.
  - **GPTBot** collects training data. "Disallowing GPTBot indicates a site's content should not be used in training generative AI foundation models."
  - **ChatGPT-User** makes user-initiated fetches and is "not used for crawling the web in an automatic fashion". robots.txt may not apply, and it doesn't decide search visibility.
  - **OAI-AdsBot** checks ad landing pages.
  - Source: [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots) [fetched]
- **Anthropic:**
  - **ClaudeBot** collects training data. Blocking it signals that future content should be excluded from training.
  - **Claude-SearchBot** indexes for search. Blocking it can reduce visibility and accuracy in Claude's search results.
  - **Claude-User** makes user-initiated retrieval. Blocking it stops retrieval for user queries.
  - The bots honor robots.txt and the non-standard Crawl-delay directive.
  - Source: [Anthropic/Claude support: Does Anthropic crawl data from the web…](https://support.claude.com/en/articles/8896518) [search summary of the official page]
- **Perplexity:**
  - **PerplexityBot** surfaces and links sites in Perplexity results and is not used for training foundation models. Perplexity recommends allowing it.
  - **Perplexity-User** makes user-requested fetches and "generally ignores robots.txt rules".
  - Source: [Perplexity crawlers doc](https://docs.perplexity.ai/guides/bots) [fetched]
- **Google:** Googlebot robots.txt rules control crawling for Search, including AI Overviews and AI Mode. **Google-Extended** controls use for AI training and grounding in other Google systems (such as Gemini apps), not Search. — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) [fetched]
- **Apple:** Applebot crawls for Siri and Spotlight. **Applebot-Extended** is a robots.txt token that opts out of training only and does not crawl by itself. Bingbot feeds Bing and Copilot. — [Apple: About Applebot](https://support.apple.com/en-us/119829); [Bing webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) [prior knowledge, not refetched]
- **JavaScript rendering (Vercel + MERJ, Dec 2024):**
  - None of the major AI crawlers render JavaScript: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Meta-ExternalAgent and Bytespider. They do download JS files.
  - Gemini uses Googlebot's infrastructure and renders JS. Applebot renders JS.
  - In the month studied, GPTBot made 569M requests across Vercel's network and Claude's crawler made 370M.
  - Vercel's advice: render main content on the server.
  - Source: [Vercel: The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) [search summary; Dec 2024, older than the preferred window]
- **Anthropic IP ranges:** a third-party guide says Anthropic doesn't publish IP ranges for its bots. — [search summary](https://icoda.io/blog/claudebot/) [low confidence]

### Inferences
- Suggested `robots.ts`: allow `*`, explicitly allow the search and user bots above, and disallow `/api/`, `/board/` private routes and user notes. Whether GPTBot, ClaudeBot, Google-Extended and Applebot-Extended get access is a business decision, and blocking them doesn't affect citations in search answers.
- Method pages, iteration tables and worked examples must be server-rendered (React Server Components or SSG), with the interactive solver hydrated on top. A client-only table won't be visible to ChatGPT, Claude or Perplexity crawlers.

### Gaps
- No 2025–2026 re-run of the JS-rendering study was found.
- Claude-SearchBot and PerplexityBot JS behaviour is not documented.

## 5. Programmatic SEO risk: scaled content abuse + helpful content

### Takeaway
Google's scaled content abuse policy targets pages made "for the primary purpose of manipulating search rankings" with little value, however they're produced. 250 method pages are safe if each one has distinct substance: a real working solver, a unique worked example and its iteration table, method-specific failure cases, and distinct visuals. They are risky if they are one template with a swapped name.

### Cited Findings
- **Policy definition:** "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings". It typically means large amounts of unoriginal content with little or no value, however it's created. — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies) [fetched]
- **Examples Google lists:**
  - "Using generative AI tools or other similar tools to generate many pages without adding value for users"
  - Scraping feeds or search results
  - "Stitching or combining content from different web pages without adding value"
  - Multiple sites made to hide the scale
  - Keyword pages that make little sense to a reader
  - Source: [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies) [fetched]
- **Background:** the policy was introduced with the March 2024 core update. The helpful content system was folded into core ranking at that time. — [Google Search Central blog, Mar 2024](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) [prior knowledge, not refetched; 2024]

### Inferences
- **Uniqueness checklist for each method page:**
  1. A method-specific worked example computed by the NETZ engine, so the numbers are real.
  2. An iteration or convergence table and an SVG plot generated from that example.
  3. Method-specific "when it fails" and comparison content.
  4. A named author or reviewer with maths credentials (E-E-A-T), plus a "reviewed on" date.
  5. Links to prerequisites and sibling methods.
  6. A syllabus mapping, for example which exam or course uses the method.
- **Noindex or consolidate near-duplicate variants** (for example, several pages per input type) under one canonical page.
- **Launch in batches** and watch Search Console indexing ("Crawled – currently not indexed" is the warning sign).

### Gaps
- No published Google numbers on thresholds for templated similarity.

## 6. Internal linking, hubs, breadcrumbs

### Takeaway
Use a hub-and-spoke structure: unit or topic hub → method pages → related methods. Add BreadcrumbList markup that matches the visible breadcrumbs. Ahrefs' fan-out findings support covering a whole topic cluster rather than isolated pages.

### Cited Findings
- Google lists internal links and textual content among the SEO fundamentals that still apply to AI features. — [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features) [fetched]
- Ahrefs recommends mapping fan-out queries and related subtopics with Parent Topics, that is, covering topics broadly. — [Ahrefs, Mar 2026](https://ahrefs.com/blog/ai-overview-citations-top-10/) [fetched]
- BreadcrumbList markup is still documented and is not in any deprecation list found this session. — [Google: Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) [prior knowledge, not refetched]; absent from the [deprecation timeline](https://patrickstox.com/technical-seo/on-page/structured-data/schema-deprecations/) [fetched]

### Inferences
- **URL pattern:** `/algorithms/{unit}/{method}`, for example `/algorithms/numerical-methods/newton-raphson`. Hub pages carry an overview, a comparison table of the unit's methods and links to every method.
- **Each method page links** to its hub, 3–6 sibling methods with descriptive anchor text, prerequisite notes, and the relevant notes or board feature.

### Gaps
- No 2025–2026 controlled study on hub structure was found. This advice is standard practice, not new evidence.

## 7. Next.js specifics (metadata, server components, sitemap/robots, canonicals, slugs, redirects)

### Takeaway
Use the App Router's `generateMetadata` for per-page title, description and canonical. Build `sitemap.ts` and `robots.ts` from the method registry. Keep slugs lowercase and hyphenated. Pick one trailing-slash policy. Send 301 or 308 redirects from old or capitalised slugs. Server-render all indexable content.

### Cited Findings
- **Metadata:** `generateMetadata` and static `metadata` exports are Server Component-only. `alternates.canonical` sets the canonical tag, and `metadataBase` resolves relative URLs. — [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) [prior knowledge, not refetched]
- **sitemap and robots:** `app/sitemap.ts` returns `MetadataRoute.Sitemap`, including `lastModified`, and `generateSitemaps` is used for large sites. `app/robots.ts` returns rules per userAgent. — [Next.js sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap); [Next.js robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) [prior knowledge, not refetched]
- **Redirects:** `redirects()` in next.config with `permanent: true` sends a 308, which Google treats like a 301. `trailingSlash` defaults to false, and Next.js redirects the other form automatically. — [Next.js redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects); [trailingSlash](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash) [prior knowledge, not refetched]
- **URL case:** Google treats URLs as case-sensitive and recommends simple, readable URLs with hyphens. — [Google: URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure) [prior knowledge, not refetched]
- **Rendering:** most AI crawlers don't execute JS, so client-only rendered content is invisible to them. — [Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler) [search summary]
- **Checking what Googlebot sees:** use Search Console's URL Inspection to see the HTML Googlebot receives. — [Google AI features doc](https://developers.google.com/search/docs/appearance/ai-features) [fetched]

### Inferences
- **Title pattern:** "{Method} Calculator – Step-by-Step with Iteration Table | NETZ", kept to about 60 characters with the exact query phrase first.
- **Meta description:** about 150 characters that name the input ("enter f(x) and x₀"), the output ("every iteration, error and convergence") and say it's free.
- **H1:** "{Method} Calculator".
- **Middleware:** lowercase any capitalised slug with a 308 redirect, and keep a `slugAliases` map in the method registry so renamed slugs redirect permanently.
- **Canonical:** self-referential and absolute on every page. Query-string solver states should canonicalise to the base page, or carry `noindex` if they can multiply without limit.
- **Mark interactive pieces** with `'use client'` only below a server-rendered article.

### Gaps
- Next.js docs weren't reloaded this session. Check the current Next.js version's defaults (for example, whether metadata streams in recent versions) before implementing.

## 8. Measuring: Search Console, Bing Webmaster Tools AI Performance, GA4 AI referrals

### Takeaway
Search Console lumps AI Overview and AI Mode traffic into "Web" with no separate filter. Bing Webmaster Tools has had an **AI Performance** report since Feb 2026 (public preview). It shows Copilot and Bing AI citations and grounding queries, but no clicks. In GA4, AI assistant traffic has to be tracked through referrer segments.

### Cited Findings
- AIO and AI Mode data appear in the Search Console Performance report under "Web". — [Google AI features doc](https://developers.google.com/search/docs/appearance/ai-features) [fetched]
- **Bing AI Performance:**
  - Search Engine Land reported Microsoft testing the report on 27 Jan 2026. It launched in public preview in Feb 2026 for all verified sites.
  - It covers citations in Copilot, Bing AI summaries and select partners, with cited URLs, grounding queries and trends.
  - It shows no clicks or CTR, can't filter by a single channel and doesn't identify partners.
  - Sources: [Search Engine Land](https://searchengineland.com/bing-webmaster-tools-ai-performance-report-468751); [Search Influence analysis](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/); [Practical Ecommerce](https://www.practicalecommerce.com/?p=1564581) [search summary]

### Inferences
- **GA4:** build an "AI assistants" channel group with a referrer regex such as `chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|bing\.com/chat`. ChatGPT appends `utm_source=chatgpt.com` to many outbound links. Both patterns come from prior knowledge and weren't verified this session.
- **Track AI citations manually** with a monthly prompt panel (for example, "newton raphson method example") across ChatGPT, Perplexity, Gemini and Claude, and log whether NETZ is cited.
- **Submit the sitemap** to both Search Console and Bing Webmaster Tools. Consider IndexNow for Bing, from prior knowledge.

### Gaps
- No primary Microsoft blog post was fetched for exact AI Performance metric definitions. Sources disagree on whether there are four or five metrics.
- No official OpenAI documentation of referrer or UTM behaviour was found this session.
