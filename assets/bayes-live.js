/* bayes-live.js - the three benches for learn-bayesian-with-phoebe.

   Real arithmetic on a world whose truth is written down. Halloway Bakeries' twelve outlets
   redeem one voucher at rates the generator states outright, so every prior, every pooling
   choice and every A/B decision can be scored against what is actually true rather than
   argued about.

   Nothing here is a stored result. Beta-Binomial posteriors are exact conjugate updates;
   intervals are 89 percent equal-tailed (the ArviZ 1.x default) read off 20,000 draws;
   partial pooling is an empirical-Bayes fit that maximises the marginal Beta-Binomial
   likelihood on a grid; A/B probabilities are Monte Carlo over the two posteriors.

   Exposes window.HALLOWAY, renders into [data-bayes-bench]. */
(function (root) {
  "use strict";
  function rng(seed){return function(){seed=(seed+0x6D2B79F5)|0;var t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function normal(r){var u=Math.max(1e-12,r()),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  /* Gamma(shape>=1) Marsaglia-Tsang; shape<1 via boost */
  function gamma(r,k){ if(k<1){ return gamma(r,k+1)*Math.pow(Math.max(1e-12,r()),1/k); }
    var d=k-1/3, c=1/Math.sqrt(9*d);
    for(;;){ var x=normal(r), v=1+c*x; if(v<=0) continue; v=v*v*v; var u=r();
      if(u<1-0.0331*x*x*x*x) return d*v; if(Math.log(u)<0.5*x*x+d*(1-v+Math.log(v))) return d*v; } }
  function beta(r,a,b){ var x=gamma(r,a), y=gamma(r,b); return x/(x+y); }
  function lgamma(z){ /* Lanczos */ var g=7, c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
    if(z<0.5) return Math.log(Math.PI/Math.sin(Math.PI*z))-lgamma(1-z); z-=1; var x=c[0]; for(var i=1;i<g+2;i++) x+=c[i]/(z+i); var t=z+g+0.5; return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(x); }
  function lbetabinom(y,n,a,b){ return lgamma(n+1)-lgamma(y+1)-lgamma(n-y+1)+lgamma(y+a)+lgamma(n-y+b)-lgamma(n+a+b)+lgamma(a+b)-lgamma(a)-lgamma(b); }
  /* exact Beta CDF (regularised incomplete beta, Lentz continued fraction) and its inverse by bisection,
     so every interval on every page is the exact 89 percent equal-tailed interval, not a draw estimate */
  function betacf(a,b,x){ var MAXIT=300,EPS=3e-14,FPMIN=1e-300,qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;
    if(Math.abs(d)<FPMIN)d=FPMIN; d=1/d; var h=d;
    for(var m=1;m<=MAXIT;m++){ var m2=2*m, aa=m*(b-m)*x/((qam+m2)*(a+m2));
      d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; h*=d*c;
      aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d;
      var del=d*c; h*=del; if(Math.abs(del-1)<EPS) break; }
    return h; }
  function betaCdf(x,a,b){ if(x<=0)return 0; if(x>=1)return 1;
    var bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));
    return x<(a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1-bt*betacf(b,a,1-x)/b; }
  function betaQuantile(q,a,b){ var lo=0,hi=1; for(var i=0;i<200;i++){ var mid=(lo+hi)/2; if(betaCdf(mid,a,b)<q) lo=mid; else hi=mid; } return (lo+hi)/2; }
  function exactSummary(a,b){ return {mean:a/(a+b), lo:betaQuantile(0.055,a,b), hi:betaQuantile(0.945,a,b)}; }
  function quant(sorted,q){ var i=Math.min(sorted.length-1,Math.max(0,Math.floor(q*sorted.length))); return sorted[i]; }
  function summary(draws){ var s=draws.slice().sort(function(x,y){return x-y;}); var m=draws.reduce(function(p,c){return p+c;},0)/draws.length;
    return {mean:m, lo:quant(s,0.055), hi:quant(s,0.945)}; }   /* 89% equal-tailed, the ArviZ 1.x default */

  /* ---- the world: 12 Halloway outlets, one voucher, redemption rate per outlet ---- */
  function world(seed, spread){       /* spread: 'real' | 'identical' | 'wild' */
    var r=rng(seed), outlets=[];
    var names=["Northgate","Riverside","Old Quay","Hillcrest","Market Row","Station","Abbey Green","Parkside","Docklands","Kingsway","The Arcade","Westfield"];
    var vol=[18,24,31,40,55,70,95,140,210,320,540,900];   /* very unequal footfall */
    var mu=0.12, kappa = spread==='identical'? 1e6 : (spread==='wild'? 6 : 60);
    for(var i=0;i<12;i++){
      var p = spread==='identical'? mu : beta(r, mu*kappa, (1-mu)*kappa);
      var n=vol[i], y=0; for(var k=0;k<n;k++) if(r()<p) y++;
      outlets.push({name:names[i], n:n, y:y, truth:p});
    }
    return outlets;
  }
  /* ---- bench A: one prior, one outlet, exact conjugate posterior ---- */
  function posterior(a,b,y,n){ return {a:a+y, b:b+n-y, mean:(a+y)/(a+b+n)}; }
  function postDraws(r,a,b,m){ var d=[]; for(var i=0;i<m;i++) d.push(beta(r,a,b)); return d; }
  /* ---- bench B: pooling ladder, truth known ---- */
  function noPool(out){ return out.map(function(o){return o.y/o.n;}); }
  function fullPool(out){ var Y=0,N=0; out.forEach(function(o){Y+=o.y;N+=o.n;}); return out.map(function(){return Y/N;}); }
  function partialPool(out){  /* empirical Bayes: maximise marginal Beta-Binomial likelihood over (mu,kappa) on a grid */
    var best=null;
    for(var mi=1;mi<200;mi++){ var mu=mi/200;
      for(var ki=0;ki<80;ki++){ var kappa=Math.exp(Math.log(2)+ki*(Math.log(5000)-Math.log(2))/79);
        var a=mu*kappa,b=(1-mu)*kappa, ll=0; out.forEach(function(o){ ll+=lbetabinom(o.y,o.n,a,b); });
        if(!best||ll>best.ll) best={ll:ll,mu:mu,kappa:kappa,a:a,b:b}; } }
    var est=out.map(function(o){ return (best.a+o.y)/(best.a+best.b+o.n); });
    return {est:est, mu:best.mu, kappa:best.kappa};
  }
  function rmse(est,out){ var s=0; out.forEach(function(o,i){ s+=Math.pow(est[i]-o.truth,2); }); return Math.sqrt(s/out.length); }
  /* ---- bench C: Bayesian A/B at the flagship ---- */
  function ab(r, yA,nA,yB,nB, m, a0,b0){ var pa=0,lossA=0,lossB=0;
    for(var i=0;i<m;i++){ var A=beta(r,a0+yA,b0+nA-yA), B=beta(r,a0+yB,b0+nB-yB);
      if(B>A) pa++; lossA+=Math.max(0,B-A); lossB+=Math.max(0,A-B); }
    return {pBgtA:pa/m, expLossChooseA:lossA/m, expLossChooseB:lossB/m}; }
  root.HALLOWAY = root.HALLOWAY || {rng:rng,beta:beta,betaCdf:betaCdf,betaQuantile:betaQuantile,exactSummary:exactSummary,world:world,posterior:posterior,postDraws:postDraws,summary:summary,
    noPool:noPool,fullPool:fullPool,partialPool:partialPool,rmse:rmse,ab:ab};
})(typeof window!=="undefined"?window:globalThis);


/* ============================================================
   The bench widget. Three tabs: prior, pooling, decision.
   Renders into [data-bayes-bench]. Every figure is computed on click.
   ============================================================ */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;
  var H = window.HALLOWAY; if (!H) return;
  var host = document.querySelector("[data-bayes-bench]"); if (!host) return;
  var W = H.world(20260918, "real");
  var f3 = function (x) { return x.toFixed(3); }, f4 = function (x) { return x.toFixed(4); };
  function fk(k){ return k < 10 ? k.toFixed(1) : String(Math.round(k)); }
  var PRIORS = { flat:[1,1,"Flat"], weak:[2,14,"Weak"], informed:[12,88,"Informed"], wrong:[40,60,"Wrong"] };

  var el = document.createElement("div"); el.className = "bb-wrap";
  el.innerHTML =
    '<div class="bb-head"><div class="bb-title">HALLOWAY BAKERIES - VOUCHER REDEMPTION, TWELVE OUTLETS</div>' +
    '<div class="bb-claim">Every true rate is written into the generator. <b>Nothing below is looked up; it is computed when you click.</b> Intervals are 89 percent equal-tailed, the ArviZ 1.x default.</div></div>' +
    '<div class="bb-tabs">' +
      '<button class="bb-tab on" data-tab="prior" type="button">A · What a prior costs</button>' +
      '<button class="bb-tab" data-tab="pool" type="button">B · The pooling ladder</button>' +
      '<button class="bb-tab" data-tab="ab" type="button">C · The A/B decision</button></div>' +
    '<div class="bb-pane" data-pane="prior"></div><div class="bb-pane" data-pane="pool" hidden></div><div class="bb-pane" data-pane="ab" hidden></div>';
  host.appendChild(el);
  el.querySelectorAll(".bb-tab").forEach(function (b) { b.addEventListener("click", function () {
    el.querySelectorAll(".bb-tab").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
    el.querySelectorAll(".bb-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== b.getAttribute("data-tab"); }); }); });

  /* ---- pane A: prior x outlet ---- */
  (function () {
    var pane = el.querySelector('[data-pane="prior"]');
    pane.innerHTML = '<div class="bb-row"><label class="bb-lab">Prior <select class="bb-sel bb-prior">' +
      Object.keys(PRIORS).map(function (k) { var p = PRIORS[k]; return '<option value="' + k + '">' + p[2] + ' - Beta(' + p[0] + ', ' + p[1] + '), ' + (p[0] + p[1]) + ' pseudo-observations</option>'; }).join("") +
      '</select></label><label class="bb-lab">Outlet <select class="bb-sel bb-outlet">' +
      W.map(function (o, i) { return '<option value="' + i + '"' + (i === 0 ? ' selected' : '') + '>' + o.name + ' - n = ' + o.n + '</option>'; }).join("") +
      '</select></label><button class="bb-run" type="button">Compute the posterior</button></div><div class="bb-out"></div>';
    pane.querySelector(".bb-run").addEventListener("click", function () {
      var pk = pane.querySelector(".bb-prior").value, o = W[+pane.querySelector(".bb-outlet").value], pr = PRIORS[pk];
      var post = H.posterior(pr[0], pr[1], o.y, o.n), s = H.exactSummary(post.a, post.b);
      var w = o.n / (o.n + pr[0] + pr[1]), inside = o.truth >= s.lo && o.truth <= s.hi;
      pane.querySelector(".bb-out").innerHTML =
        '<div class="bb-reads"><div class="bb-read"><b>' + f3(s.mean) + '</b><span>posterior mean</span></div>' +
        '<div class="bb-read"><b>' + f3(s.lo) + ' to ' + f3(s.hi) + '</b><span>89% interval</span></div>' +
        '<div class="bb-read"><b>' + f3(o.truth) + '</b><span>true rate</span></div>' +
        '<div class="bb-read ' + (inside ? 'bb-good' : 'bb-bad') + '"><b>' + (inside ? 'inside' : 'OUTSIDE') + '</b><span>truth vs interval</span></div></div>' +
        '<p>' + o.name + ' redeemed ' + o.y + ' of ' + o.n + ' (observed ' + f3(o.y / o.n) + '). The prior is worth ' + (pr[0] + pr[1]) + ' pseudo-observations, so the data carry weight ' + o.n + ' / (' + o.n + ' + ' + (pr[0] + pr[1]) + ') = <b>' + w.toFixed(2) + '</b>. Posterior mean ' + f3(s.mean) + ' against a true rate of ' + f3(o.truth) + (inside ? '.' : ': <b>the interval does not contain the truth.</b>') + '</p>';
    });
  })();

  /* ---- pane B: pooling ladder ---- */
  (function () {
    var pane = el.querySelector('[data-pane="pool"]');
    pane.innerHTML = '<div class="bb-row"><label class="bb-lab">World <select class="bb-sel bb-world">' +
      '<option value="real">Halloway as observed - real spread</option><option value="identical">A world where the outlets are truly identical</option><option value="wild">A world where they are wildly different</option></select></label>' +
      '<button class="bb-run" type="button">Score the three methods</button></div><div class="bb-out"></div>';
    pane.querySelector(".bb-run").addEventListener("click", function () {
      var w = H.world(20260918, pane.querySelector(".bb-world").value);
      var np = H.noPool(w), fp = H.fullPool(w), pp = H.partialPool(w);
      var r = [H.rmse(np, w), H.rmse(fp, w), H.rmse(pp.est, w)], best = r.indexOf(Math.min.apply(null, r));
      var rows = w.map(function (o, i) { var eN = Math.abs(np[i] - o.truth), eP = Math.abs(pp.est[i] - o.truth);
        return '<tr><td>' + o.name + '</td><td>' + o.n + '</td><td>' + f3(np[i]) + '</td><td>' + f3(pp.est[i]) + '</td><td>' + f3(o.truth) + '</td><td class="' + (eP < eN ? 'bb-good' : (eP > eN ? 'bb-bad' : '')) + '">' + (eP < eN ? 'helped' : (eP > eN ? 'hurt' : 'same')) + '</td></tr>'; }).join("");
      pane.querySelector(".bb-out").innerHTML =
        '<div class="bb-reads"><div class="bb-read' + (best === 0 ? ' bb-good' : '') + '"><b>' + f4(r[0]) + '</b><span>no pooling, RMSE</span></div>' +
        '<div class="bb-read' + (best === 1 ? ' bb-good' : '') + '"><b>' + f4(r[1]) + '</b><span>complete pooling</span></div>' +
        '<div class="bb-read' + (best === 2 ? ' bb-good' : '') + '"><b>' + f4(r[2]) + '</b><span>partial pooling</span></div>' +
        '<div class="bb-read"><b>' + f3(pp.mu) + ' / ' + fk(pp.kappa) + '</b><span>learned mu / kappa</span></div></div>' +
        '<p>Partial pooling learned how much to pool from the data: each outlet is pulled toward ' + f3(pp.mu) + ' with data weight n / (n + ' + fk(pp.kappa) + '). Per outlet:</p>' +
        '<table class="bb-tbl"><thead><tr><th>Outlet</th><th>n</th><th>No pooling</th><th>Partial</th><th>Truth</th><th>Effect</th></tr></thead><tbody>' + rows + '</tbody></table>';
    });
  })();

  /* ---- pane C: the A/B decision ---- */
  (function () {
    var pane = el.querySelector('[data-pane="ab"]');
    var r0 = H.rng(99), pA = W[11].truth, pB = pA + 0.025, A = [], B = [];
    for (var i = 0; i < 3000; i++) { A.push(r0() < pA ? 1 : 0); B.push(r0() < pB ? 1 : 0); }
    var cum = function (arr, n) { var s = 0; for (var k = 0; k < n; k++) s += arr[k]; return s; };
    pane.innerHTML = '<div class="bb-row"><label class="bb-lab">Look at the experiment after <select class="bb-sel bb-n">' +
      [50, 100, 200, 400, 900, 1500, 3000].map(function (n) { return '<option value="' + n + '">' + n + ' per arm</option>'; }).join("") +
      '</select></label><label class="bb-lab">Stop when expected loss is below <select class="bb-sel bb-thr"><option value="0.001">0.001</option><option value="0.0005">0.0005</option><option value="0.005">0.005</option></select></label>' +
      '<button class="bb-run" type="button">Read the posterior</button></div><div class="bb-out"></div>';
    pane.querySelector(".bb-run").addEventListener("click", function () {
      var n = +pane.querySelector(".bb-n").value, thr = +pane.querySelector(".bb-thr").value, yA = cum(A, n), yB = cum(B, n);
      var res = H.ab(H.rng(5), yA, n, yB, n, 20000, 1, 1);
      var call = res.expLossChooseB < thr ? 'stop and choose B' : (res.expLossChooseA < thr ? 'stop and choose A' : 'keep going');
      pane.querySelector(".bb-out").innerHTML =
        '<div class="bb-reads"><div class="bb-read"><b>' + f3(res.pBgtA) + '</b><span>P(B &gt; A)</span></div>' +
        '<div class="bb-read"><b>' + f4(res.expLossChooseB) + '</b><span>expected loss if you choose B</span></div>' +
        '<div class="bb-read"><b>' + f4(res.expLossChooseA) + '</b><span>expected loss if you choose A</span></div>' +
        '<div class="bb-read ' + (call === 'keep going' ? '' : 'bb-good') + '"><b>' + call + '</b><span>the rule says</span></div></div>' +
        '<p>Same experiment, first ' + n + ' customers per arm: A redeemed ' + yA + ' (' + f3(yA / n) + '), B redeemed ' + yB + ' (' + f3(yB / n) + '). True rates are 0.150 and 0.175. A probability is not a decision; a probability times what you stand to lose is.</p>';
    });
  })();
})();
