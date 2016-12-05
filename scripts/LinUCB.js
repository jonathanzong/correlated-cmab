var LinUCB = {
  n_arms: 3, // number of arms
  n_extra_features: 0, // number of context features (not counting n correlations)
  alpha: 2.627,
  arms: [],
  a: [], // a[t] = arm chosen at t
  r: [], // r[t] = reward at t
  t: 0,
  reward_mapping: function(arm_id) {
    return {
      mean: Math.random(),
      variance: Math.random()
    };
  },
  init: function() {
    LinUCB.arms = [];
    LinUCB.a = [];
    LinUCB.r = [];
    LinUCB.t = 0;
    for (var i = 0; i < LinUCB.n_arms; i++) {
      LinUCB.arms[i] = new Arm(i);
    }
  },
  iter: function() {
    // choose
    var max_p = LinUCB.arms[0].prediction();
    var i_max = 0;
    for (var i = 1; i < LinUCB.n_arms; i++) {
      var p = LinUCB.arms[i].prediction();
      if (p > max_p) {
        max_p = p;
        i_max = i;
      }
    }
    var chosen = LinUCB.arms[i_max];
    var reward = chosen.reward();
    // store
    LinUCB.a.push(i_max);
    LinUCB.r.push(reward);
    console.log(LinUCB.t + ": " + i_max + " | " + reward);
    LinUCB.t++;
    // update
    chosen.A = math.add(chosen.A, math.multiply(chosen.context, math.transpose(chosen.context)));
    chosen.b = math.add(chosen.b, math.multiply(reward, chosen.context));

    return {
      chosen: i_max,
      reward: reward
    }
  } 
}