var Arm = function (id) {
  var d = LinUCB.d_extra_features; // number of arm-specific features
  var k = LinUCB.k_arms; // number of shared/common features
  this.id = id;
  this.A = math.eye(d);
  this.B = math.zeros(d, k);
  this.b = math.zeros(d, 1);
  this.z_shared_context = math.zeros(k, 1);
  this.x_arm_context = math.zeros(d, 1);
  this.setSharedContextAt(id, 1) // arm is perfectly correlated with itself
  var distribution = LinUCB.reward_mapping(id);
  this.reward_distribution = gaussian(distribution.mean, distribution.variance);
  this.rewardAtTime = [];
  var cachedReward = localStorage.getItem('rewardAtTime'+id);
  if (cachedReward) {
    this.rewardAtTime = JSON.parse(cachedReward);
  }
  else {
    for (var t = 0; t < 5001; t++) {
      this.rewardAtTime[t] = this.reward_distribution.ppf(Math.random());
    }
    localStorage.setItem('rewardAtTime'+id, JSON.stringify(this.rewardAtTime));
  }
};

Arm.prototype.setSharedContextAt = function(idx, val) {
  this.z_shared_context.subset(math.index(idx, 0), val);
}

Arm.prototype.theta = function() {
  return math.multiply(math.inv(this.A), math.subtract(this.b, math.multiply(this.B, LinUCB.beta())));
};

Arm.prototype.s = function() {
  var x = this.x_arm_context;
  var xT = math.transpose(this.x_arm_context);
  var z = this.z_shared_context;
  var zT = math.transpose(this.z_shared_context);
  var A0inv = math.inv(LinUCB.A0);
  var Ainv = math.inv(this.A);
  var BT = math.transpose(this.B);
  var term0 = math.squeeze(math.multiply(math.multiply(zT, A0inv), z));
  var term1 = 2 * math.squeeze(math.multiply(math.multiply(math.multiply(math.multiply(zT, A0inv), BT), Ainv), x));
  var term2 = math.squeeze(math.multiply(math.multiply(xT, Ainv), x));
  var term3 = math.squeeze(math.multiply(math.multiply(math.multiply(math.multiply(math.multiply(math.multiply(xT, Ainv), this.B), A0inv), BT), Ainv), x));

  return term0 - term1 + term2 + term3;
};

Arm.prototype.prediction = function() {
  // console.log(this._prediction_mean() + " " + this._prediction_variance());
  return this._prediction_mean() + this._prediction_variance();
};

Arm.prototype._prediction_mean = function() {
  math["transpose"] // WTF? why do i need this
  return math.squeeze(math.multiply(math.transpose(this.z_shared_context), LinUCB.beta())) + 
    math.squeeze(math.multiply(math.transpose(this.x_arm_context), this.theta()));
}

Arm.prototype._prediction_variance = function() {
  return LinUCB.alpha * Math.sqrt(this.s());
}

Arm.prototype.reward = function(t) {
  // returns a sample from gaussian reward distribution
  return this.rewardAtTime[t];
};
