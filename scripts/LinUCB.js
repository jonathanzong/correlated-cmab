var LinUCB = {
  k_arms: 3, // number of arms
  d_extra_features: 1, // number of context features (not counting n shared correlations)
  alpha: 2.627, // upper bound coefficient
  reward_mapping: function(arm_id) {
    return {
      mean: 2 * (arm_id / LinUCB.k_arms) - 1,
      variance: 1
    };
  },
  init: function() {
    LinUCB.arms = [];
    LinUCB.a = [];
    LinUCB.r = [];
    LinUCB.t = 0;
    for (var i = 0; i < LinUCB.k_arms; i++) {
      LinUCB.arms[i] = new Arm(i);
    }
    LinUCB.A0 = math.eye(LinUCB.k_arms);
    LinUCB.b0 = math.zeros(LinUCB.k_arms, 1);
    LinUCB.beta = function() {
      return math.multiply(math.inv(LinUCB.A0), LinUCB.b0);
    };
  },
  iter: function() {
    // choose
    var max_p = LinUCB.arms[0].prediction();
    var i_max = 0;
    for (var i = 1; i < LinUCB.k_arms; i++) {
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
    LinUCB.A0 = math.add(LinUCB.A0, math.multiply(math.multiply(math.transpose(chosen.B), math.inv(chosen.A)), chosen.B));
    LinUCB.b0 = math.add(LinUCB.b0, math.multiply(math.multiply(math.transpose(chosen.B), math.inv(chosen.A)), chosen.b));
    chosen.A = math.add(chosen.A, math.multiply(chosen.x_arm_context, math.transpose(chosen.x_arm_context)));
    chosen.B = math.add(chosen.B, math.multiply(chosen.x_arm_context, math.transpose(chosen.z_shared_context)));
    chosen.b = math.add(chosen.b, math.multiply(reward, chosen.x_arm_context));
    LinUCB.A0 = math.add(LinUCB.A0, math.subtract(math.multiply(chosen.z_shared_context, math.transpose(chosen.z_shared_context)), math.multiply(math.multiply(math.transpose(chosen.B), math.inv(chosen.A)), chosen.B)) );
    LinUCB.b0 = math.add(LinUCB.b0, math.subtract(math.multiply(reward, chosen.z_shared_context), math.multiply(math.multiply(math.transpose(chosen.B), math.inv(chosen.A)), chosen.b)) );

    return {
      chosen: i_max,
      reward: reward
    }
  } 
}