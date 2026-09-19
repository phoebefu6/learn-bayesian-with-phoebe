# Learn Bayesian with Phoebe

Sixteen sessions on estimating from small data honestly: what a prior costs, why the posterior is a distribution, how twelve outlets beat one, and how a probability becomes a decision.

**Live:** https://phoebefu6.github.io/learn-bayesian-with-phoebe/

Two tracks. **Leader, 6 sessions, no code:** what a prior costs, small data and honest uncertainty, borrowing strength, reading a posterior, the prior argument, commissioning a Bayesian answer. **Practitioner, 10 sessions:** Beta-Binomial by hand, four priors, the posterior as a distribution, MCMC and its diagnostics, PyMC 6 end to end, hierarchical models, Bayesian A/B decisions, checking the model, saying it to executives, and the pooling bench.

- **The seam.** `learn-statistics-with-phoebe` owns frequentist inference, `learn-experimentation-with-phoebe` owns test mechanics and the peeking argument, `learn-decision-intelligence-with-phoebe` owns calibration measurement. None of it is re-taught here; each is named and handed over.
- **The tools as they are in September 2026.** PyMC 6.3.2 on PyTensor 3 with nutpie as the default sampler; ArviZ 1.3.0 as three libraries with `xarray.DataTree` in place of `InferenceData`; and the summary interval default now **89 percent equal-tailed**, which is why every interval in the course says its level and its kind.
- `assets/bayes-live.js` holds three benches on **Halloway Bakeries**, twelve outlets with footfall from 18 to 900 vouchers a month and every true redemption rate written into the generator. Conjugate posteriors and their intervals are exact (Beta quantiles computed in the browser); partial pooling is an empirical-Bayes fit; the A/B probabilities are Monte Carlo over 20,000 draws.
- **Bench A, what a prior costs.** At Northgate (18 vouchers, true rate 0.192) an informed prior worth 100 pseudo-observations lands at 0.110 with an interval of 0.068 to 0.159 that misses the truth. At Westfield (900 vouchers) a wrong prior of the same weight still moves the answer by 0.026. Data outvote a prior; they do not wash it out.
- **Bench B, the pooling ladder.** Against the twelve true rates, no pooling scores an RMSE of 0.054, complete pooling 0.031, partial pooling **0.025**, and partial pooling wins or ties in a world where the outlets are identical and a world where they are wildly different. It learns how much to pool (kappa 116 on the real data, 3.6 in the wild world). It helped six outlets by tenths and hurt six by thousandths, and still left Northgate under-estimated.
- **Bench C, the A/B decision.** P(B > A) of 0.915 at fifty per arm was **not** enough to stop; the expected loss of choosing B was three times the threshold. The rule stops at one hundred per arm, and across 200 seeded replays it stopped on the wrong arm 2 times. That count is stated on the page. Bayesian A/B has no free lunch on peeking; it controls the cost of a wrong stop, not its frequency.
- Running artifact: a **defensible estimate from small data** with its prior, its interval level and kind, its decision rule and its measured error rate written down.
- Full source map, the enforced seam and the frozen canon: `materials/official-course-map.md`

by Phoebe Fu
