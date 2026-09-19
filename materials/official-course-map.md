# Official course map - learn-bayesian-with-phoebe

Built 2026-09-18. Hub bucket `ds` (Data Science), difficulty tier 4. Flips the hub's existing
`planned` entry live and changes its `audience` from `builder` to `both`. Two tracks:
leader 6 x 45 min, practitioner 10 x 45 min.

Running artifact: a **defensible estimate from small data** - the voucher redemption rate at
**Halloway Bakeries**, a fictional twelve-outlet chain whose footfall ranges from 18 vouchers a
month at Northgate to 900 at Westfield. Every outlet's true rate is written into the generator,
so every prior, every pooling choice and every A/B decision can be scored against what is
actually true.

---

## The seam - read this before writing a single page

Unlike the two courses before it, this card's blurb was **honest**: priors, hierarchical models,
MCMC, PyMC, Bayesian A/B testing and the language of uncertainty are all unowned. `conjugate`,
`Beta distribution` and `partial pooling` return **zero hits across the estate**. Every sibling
mention of Bayes is a passing reference, and the seam is about what those siblings own around it.

| Sibling | What it already owns, live | What this course does instead |
|---|---|---|
| `learn-statistics-with-phoebe` (ds, d2) | Frequentist inference end to end: b5 sampling and the CLT, b6 estimation and MLE, **b7 confidence intervals**, b8 hypothesis testing, b9 chi-square and ANOVA; a2 "thinking in odds" (Bayes' rule on point probabilities) | **No frequentist procedure is re-taught.** Confidence intervals and p-values appear only in the contrast "a credible interval is the sentence everybody thinks a confidence interval is". Bayes' rule on a single probability is a2's; this course owns Bayes over a *parameter*, where the posterior is a distribution |
| `learn-experimentation-with-phoebe` (ds, d3) | A/B mechanics: b2 power and sample size, b3 randomisation, b4 running a test, b6 sequential testing and peeking (with a 2-minute self-study aside naming Thompson sampling), b7 CUPED | **No test mechanics.** Bayesian A/B here is the *decision layer*: P(B > A), expected loss, when to stop. Randomisation, power and the peeking problem are handed to that course by name |
| `learn-decision-intelligence-with-phoebe` (lead) | 02 the calibration lab (Brier, measured calibration of a human forecaster), **04 "Uncertainty you can promise"** (conformal prediction, auditing a model's stated probability, which grade goes where in the memo) | **No calibration measurement, no conformal.** This course owns the Bayesian sentence - "an 89 percent probability the rate is between 0.124 and 0.161" - and hands "was that 89 percent honest, measured over many forecasts" to decision-intelligence |
| `learn-causal-inference-with-phoebe` (ds, d4) | The causal model, identification, what not to adjust for | Untouched. Nothing here is causal; where a page might drift, it names the course and stops |
| `learn-marketing-attribution-with-phoebe` (aiap) | b8 names Meridian and PyMC-Marketing as MMM tools, teaches the linear version | MMM is not taught here. PyMC appears as the general tool, never as PyMC-Marketing |
| `learn-ai-sports-with-phoebe` (aiap) | b3 names "Bayesian hierarchical models that pool player effects with shrinkage" as what works for xG | Named there, taught here. p6 is the session that page points at |

**What this course uniquely owns:** the prior as pseudo-observations and what it costs; the
posterior as a distribution; conjugate Beta-Binomial by hand; the four kinds of prior and the
argument between them; MCMC as sampling and its diagnostics; PyMC 6 and ArviZ 1 as they are in
September 2026; hierarchical models, partial pooling and shrinkage with a known truth; Bayesian
A/B as a decision (P(B > A), expected loss, ROPE); posterior predictive checks; and the executive
sentence for uncertainty.

---

## Verified facts (with their source tier)

**Tier 1, the tools as they actually are, checked against PyPI and the maintainers' own release
notes on 2026-09-18. This is the part most likely to be stale in anybody's head.**

- **PyMC is at 6.3.2** (released 8 September 2026). **PyMC 6.0.0 shipped on 13 May 2026.**
  Requires **Python 3.12 or later**. Source: PyPI release history.
- **PyMC 6 breaking changes** (from the 6.0.0 release notes): built on **PyTensor 3.0** with the
  default backend switched to **numba** (revert with `pytensor.config.linker = "cvm"`);
  **nutpie is the default NUTS sampler when installed** (`pip install pymc[nutpie]`), with
  **400 tuning steps by default under nutpie against 1000 under PyMC's own NUTS**;
  `sample_prior_predictive` lost its deprecated `samples` argument;
  `sample_posterior_predictive` gained `sample_vars` and `freeze_vars`; several functions were
  removed from the root namespace. **`pymc3` is a dead import.** McElreath's own 2024 course
  page still lists "Python with PyMC3"; do not copy that.
- **ArviZ is at 1.3.0** and is now three libraries under one namespace: **arviz-base** (data and
  converters), **arviz-stats** (diagnostics), **arviz-plots** (plotting), all reached through
  `import arviz as az`. Source: the ArviZ 1.x migration guide.
- **`arviz.InferenceData` no longer exists.** The container is **`xarray.DataTree`**. Existing
  netCDF and zarr files still load: `az.from_netcdf` now wraps `open_datatree`, and groups are
  reached as `dt["posterior"].dataset`.
- **Renamed plots:** `plot_trace` became **`plot_trace_dist`** and **`plot_trace_rank`**;
  `plot_posterior` and `plot_density` became **`plot_dist`**; `plot_ppc` became **`plot_ppc_dist`**;
  `plot_forest` stays and gained `plot_ridge`. Every plot now returns a `PlotCollection`, not axes.
- **The interval default changed, and it matters for every number on every page.**
  `hdi_prob` was renamed **`prob`**, and two rcParams now govern summaries:
  **`stats.ci_prob` = 0.89 (was 0.94)** and **`stats.ci_kind` = "eti" (was HDI)**. The migration
  guide's reason: "Using 0.89 produces intervals with lower variability, leading to more stable
  summaries." A third party (the CoursIA repo, issue #15592) documented two notebooks whose
  intervals **silently became equal-tailed** on upgrade while the prose still said HDI. **Every
  interval in this course is therefore an 89 percent equal-tailed interval**, computed as the
  5.5 and 94.5 percent quantiles, and every page says so.
- **Model-block names used on the pages (long-stable PyMC signatures):** `pm.Beta("rate", alpha=1,
  beta=1)`, `pm.Binomial("redeemed", n=900, p=rate, observed=127)`, `pm.sample()` bare (nutpie
  picks the defaults), `pm.sample_prior_predictive()`, `pm.sample_posterior_predictive(dt)`.
- **Predictive calls on the pages:** written as `dt = pm.sample_posterior_predictive(dt)` so the
  code is correct whether the tree is extended in place or a new one is returned; the prior
  predictive is read from the `prior_predictive` group of the tree it returns.
- **R-hat reads 1 when the chains agree and grows as they disagree**; no threshold is asserted
  anywhere in the course. ESS is the number of effectively independent draws. A divergence is a
  transition the sampler could not follow. A passing set proves the sampler explored THIS model's
  posterior and nothing about whether the model is right (session 8 owns that).
- Diagnostics: `az.ess(dt, sample_dims=["chain", "draw"])`, `az.rhat(dt)`, or the xarray accessor
  `dt.azstats.ess()` after importing `arviz_stats`.

**Tier 1, the ideas, from the primary texts.**

- **Statistical Rethinking, 2nd edition** (McElreath). The 2024 course runs 20 lectures over 10
  weeks; the ones this course leans on are lecture 2 "Garden of Forking Data" (the posterior as
  counting), lecture 8 "MCMC", lectures 12 and 13 "Multilevel Models" and "Multilevel Adventures"
  (partial pooling), and lecture 7 "Overfitting" (predictive checks). Source: the
  `rmcelreath/stat_rethinking_2024` course page.
- **Gelman, Simpson and Betancourt (2017), "The prior can generally only be understood in the
  context of the likelihood."** Abstract, quoted: "a model encoding true prior information should
  be chosen without reference to the model of the measurement process, but almost all common prior
  modeling techniques are implicitly motivated by a reference likelihood." Their resolution is to
  place "the choice of prior into the context of the entire Bayesian analysis, from inference to
  prediction to model evaluation." **This is the anchor for a5, and it is taught as a live
  disagreement**: the subjectivist position (the prior encodes belief, full stop), the
  reference-prior position (let the data speak), and the weakly-informative position (regularise
  toward plausible values, check by prior prediction). None of the three is declared the winner.
- **Kruschke (2013), "Bayesian estimation supersedes the t test", Journal of Experimental
  Psychology: General, 142(2), 573-603, doi 10.1037/a0029146.** The decision rule compares the
  posterior interval to a **region of practical equivalence (ROPE)** and, unlike a t test, **can
  accept the null** when the estimate is precise. This is the anchor for p7's decision layer.

**Tier 2, named for orientation, never taught as a recipe.**

- Thompson sampling and bandits: named in p7 as the traffic-allocation cousin of the decision rule
  and handed to `learn-experimentation` b6, which already carries them.
- Bayesian structural time series (CausalImpact) and PyMC-Marketing: named once as where Bayesian
  methods show up in sibling courses, not taught.

---

## Frozen canon - the Halloway benches

Computed in node from `assets/bayes-live.js` before any page quoted a number. Every figure is real
arithmetic: conjugate Beta-Binomial posteriors are exact and so are their 89 percent equal-tailed
intervals (Beta quantiles at 5.5 and 94.5 percent, computed in the engine by the regularised
incomplete beta function; the bench C decision probabilities are Monte Carlo over 20,000 draws), partial pooling is an empirical-Bayes fit that maximises the marginal
Beta-Binomial likelihood over a grid, and every A/B probability is Monte Carlo over the two
posteriors. Any page citing these must match exactly.

**The world.** Twelve outlets, one voucher, one month. Footfall is deliberately unequal:
18, 24, 31, 40, 55, 70, 95, 140, 210, 320, 540, 900 vouchers. True rates are drawn around 0.12
with real spread. **Grand redemption rate 0.141; mean of the true rates 0.132.**

| Outlet | n | Redeemed | Observed | True rate |
|---|---|---|---|---|
| Northgate | 18 | 1 | 0.056 | **0.192** |
| Riverside | 24 | 4 | 0.167 | 0.124 |
| Old Quay | 31 | 1 | 0.032 | 0.090 |
| Hillcrest | 40 | 9 | 0.225 | 0.137 |
| Market Row | 55 | 8 | 0.145 | 0.145 |
| Station | 70 | 9 | 0.129 | 0.109 |
| Abbey Green | 95 | 7 | 0.074 | 0.098 |
| Parkside | 140 | 22 | 0.157 | 0.155 |
| Docklands | 210 | 19 | 0.090 | 0.098 |
| Kingsway | 320 | 67 | 0.209 | 0.163 |
| The Arcade | 540 | 71 | 0.131 | 0.128 |
| Westfield | 900 | 127 | 0.141 | 0.150 |

**Northgate is the course's recurring character:** the smallest outlet, the genuinely best
performer, and observed at 0.056 because one redemption in eighteen is what a true 0.192 looks
like at that size.

### Bench A - a prior is a number of pseudo-observations

A Beta(a, b) prior is worth **a + b pseudo-observations**. Four priors are on the bench:

| Prior | Beta(a, b) | Prior mean | Pseudo-obs |
|---|---|---|---|
| Flat | (1, 1) | 0.500 | 2 |
| Weak | (2, 14) | 0.125 | 16 |
| Informed | (12, 88) | 0.120 | 100 |
| Wrong | (40, 60) | 0.400 | 100 |

**Northgate, n = 18, truth 0.192.** Posterior mean and 89 percent interval:

| Prior | Posterior mean | 89% interval | Contains the truth |
|---|---|---|---|
| Flat | 0.100 | 0.020 to 0.222 | yes, and it is wide |
| Weak | 0.088 | 0.026 to 0.175 | **no** |
| Informed | 0.110 | 0.068 to 0.159 | **no** |
| Wrong | 0.347 | 0.279 to 0.419 | no |

**The informed prior was confidently wrong at Northgate.** One hundred pseudo-observations centred
on 0.120 against eighteen real ones: the data carry weight 18 / (18 + 100) = 0.15, and Northgate is
the one outlet whose truth sits outside what the prior allowed for. That is the cost of a prior,
measured, and it is the honest counterweight to bench B.

**Westfield, n = 900, truth 0.150.** Posterior means: flat 0.142, weak 0.141, informed 0.139,
wrong **0.167**. **A prior worth 100 pseudo-observations still moves the answer by 0.026 at
n = 900.** The residual bias from each prior at Westfield: flat +0.0008, weak -0.0003, informed
-0.0021, wrong **+0.0259**. Data do not "wash out" a prior; they outvote it, and a hundred votes
take a long time to outvote.

### Bench B - the pooling ladder, scored against the truth

Root-mean-square error of the twelve outlet estimates against the twelve true rates:

| World | No pooling | Complete pooling | Partial pooling |
|---|---|---|---|
| **Real spread** (the Halloway data) | 0.054 | 0.031 | **0.025** |
| Outlets truly identical | 0.034 | 0.0065 | **0.0051** |
| Outlets wildly different | 0.033 | **0.145** | 0.030 |

Partial pooling is the empirical-Bayes fit: on the real data it learns **mu = 0.135, kappa = 116**,
so each outlet is shrunk toward 0.135 with data weight n / (n + 116): **0.13 at Northgate, 0.89 at
Westfield.** In the identical world it learns kappa at the grid ceiling (the outlets are the same,
so pool them); in the wild world it learns kappa = 3.6 (barely pool at all). **The method reads the
answer off the data rather than having it asserted.**

**p6's full hierarchical block** uses `pm.HalfNormal("kappa", 200.0)` as the prior on the pooling
strength and `shape=12` for the outlet rates. That is a house choice for the page, not a canon
result, and the page quotes no posterior numbers from it (the bench uses the empirical-Bayes fit).
Derived weights quoted in prose: at kappa 3.6 (the wild world) Northgate's data weight is
18 / (18 + 3.6), about 0.83; under Beta(1, 1) the prior predictive treats every count from 0 to 900
as equally plausible.

**Per outlet, partial pooling helped six and hurt six.** The helps are large and land on the tiny
outlets: Northgate 0.136 to 0.068, Hillcrest 0.088 to 0.021, Old Quay 0.058 to 0.023, Kingsway
0.046 to 0.027, Riverside 0.043 to 0.017, Abbey Green 0.024 to 0.010. The hurts are small and land
on the well-measured ones: Market Row 0.000 to 0.007, Parkside 0.002 to 0.008, Station 0.020 to
0.024, Docklands 0.007 to 0.009, The Arcade and Westfield unchanged to three decimals.
**Shrinkage buys tenths on the outlets that need it and costs thousandths on the ones that do
not.** Say both halves. Northgate is still under-estimated at 0.124 against a truth of 0.192; the
method halved the error, it did not remove it.

### Bench C - the A/B decision at Westfield

A new voucher design B against the current A, run as **one cumulative experiment** (n = 50 is the
first fifty of the same 3,000). True rates: **A 0.150, B 0.175**, a lift of 2.5 points. Flat
priors, 20,000 posterior draws. The decision rule: stop when the expected loss of the chosen arm
falls below 0.001.

| n per arm | Observed A | Observed B | P(B > A) | E[loss] if choose B | E[loss] if choose A | Rule says |
|---|---|---|---|---|---|---|
| 50 | 0.100 | 0.200 | 0.915 | 0.0029 | 0.0984 | keep going |
| **100** | 0.100 | 0.200 | **0.975** | **0.0005** | 0.0989 | **stop, choose B** |
| 200 | 0.115 | 0.190 | 0.980 | 0.0003 | 0.0743 | stop, choose B |
| 400 | 0.135 | 0.205 | 0.996 | 0.0000 | 0.0695 | stop, choose B |
| 900 | 0.131 | 0.187 | 0.999 | 0.0000 | 0.0557 | stop, choose B |
| 3000 | 0.152 | 0.186 | 1.000 | 0.0000 | 0.0339 | stop, choose B |

**The rule stops at n = 100 per arm.** Note P(B > A) = 0.915 at n = 50 was **not** enough: the
expected loss of choosing B was still 0.0029, three times the threshold. A probability alone is not
a decision; a probability times a stake is.

**The honest error rate, computed rather than promised.** Across 200 seeded replays of the same
experiment, stopping at n = 100 by the same rule: **23 of 200 would have stopped, and 2 of those
200 would have stopped on the wrong arm.** That is a 1 percent wrong-stop rate at that sample
size. State it. The rule is not free, it is cheap.

**A claim NOT to make.** Do not write that Bayesian A/B testing "has no peeking problem" or "lets
you stop whenever you like". The expected-loss rule controls the *cost* of a wrong decision, not
the *frequency* of one, and the 2 in 200 above is the frequency. `learn-experimentation` b6 owns
the peeking argument; this course reports the measured rate and hands the argument over.

---

## Coverage per session

`✓` = taught to working depth. `◐` = named and handed to the session or course that owns it.

### Leader track

| Session | Covers | Depth |
|---|---|---|
| a1 What a prior costs | A prior is pseudo-observations; the four priors at Northgate and Westfield; the informed prior confidently wrong; the wrong prior still biased at 900 | ✓ |
| a2 Small data, honest uncertainty | Why n = 18 cannot give a point; the posterior as a distribution; the 89 percent interval sentence and what it actually claims | ✓ |
| a3 Borrowing strength | Twelve outlets beat one; the pooling ladder; shrinkage helps six and hurts six; Northgate still under-estimated | ✓ |
| a4 Reading a posterior | P(B > A), expected loss, credible against confidence; why 0.915 was not enough | ✓ |
| a5 The prior argument | Subjective, reference and weakly-informative positions, taught as a disagreement; Gelman, Simpson and Betancourt's resolution; prior predictive checks as the shared ground | ✓ |
| a6 Commissioning a Bayesian answer | What to ask for in writing: the prior and its pseudo-count, the interval kind and level, the decision rule, the check that was run | ✓ |
| Calibration measurement, conformal prediction | Handed to `learn-decision-intelligence` 02 and 04 | ◐ |

### Practitioner track

| Session | Covers | Depth |
|---|---|---|
| p1 Beta-Binomial by hand | Conjugacy; a + y and b + n - y; the posterior mean as a weighted average of prior mean and data | ✓ |
| p2 Four priors | Flat, weak, informed, wrong on the same data; pseudo-observations; the Northgate table | ✓ |
| p3 The posterior is a distribution | Grid approximation, then sampling; summaries as quantiles; 89 percent equal-tailed and why that is the default now | ✓ |
| p4 MCMC and its diagnostics | Why sample; what a chain is; R-hat, ESS, divergences; `plot_trace_rank` | ✓ |
| p5 PyMC, the first model | PyMC 6.3, nutpie, DataTree, `az.summary`; the Westfield model end to end | ✓ |
| p6 Hierarchical models | Partial pooling; the pooling ladder with known truth; kappa as learned pooling strength; where it hurts | ✓ |
| p7 Bayesian A/B decisions | P(B > A), expected loss, ROPE, the stopping rule, the 2-in-200 | ✓ |
| p8 Checking the model | Prior and posterior predictive checks; LOO named; what a check can and cannot catch | ✓ |
| p9 Saying it to executives | The sentence, the interval, the probability of a difference, the stake | ✓ |
| p10 The pooling bench | All three benches live in the browser, scored against the truth | ✓ |
| Power, randomisation, peeking | Pointed at `learn-experimentation` b2, b3, b6 | ◐ |
| Frequentist intervals and tests | Pointed at `learn-statistics` b7, b8 | ◐ |

## Not covered, by design

- **Frequentist inference.** `learn-statistics` owns it; this course contrasts, never re-teaches.
- **Experiment mechanics.** Power, randomisation and peeking live in `learn-experimentation`.
- **Calibration audits and conformal prediction.** `learn-decision-intelligence`.
- **Marketing mix models.** `learn-marketing-attribution`, including PyMC-Marketing.
- **Gaussian processes, measurement error, missing data, social networks.** McElreath lectures
  14 to 18; named as the road onward in p8, not taught.
- **Bayes factors and model comparison by marginal likelihood.** Named once in p8 as the thing
  Kruschke's rule is explicitly not; not taught.

## Re-verify before delivery

The tool layer moves fast. PyMC 6.0.0 is four months old and ArviZ 1.x changed the interval
default; before any re-delivery, check PyPI for the current PyMC and ArviZ versions and re-read
the ArviZ migration guide for `stats.ci_prob` and `stats.ci_kind`. The benches are deterministic
from fixed seeds: if `bayes-live.js` is edited, re-run the node harness and update every number in
this file before touching a page.
