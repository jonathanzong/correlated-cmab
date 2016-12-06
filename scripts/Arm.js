var Arm = function (id) {
  var d = LinUCB.d_extra_features; // number of arm-specific features
  var k = LinUCB.n_arms; // number of shared/common features
  this.id = id;
  this.A = math.eye(d + k);
  this.b = math.zeros(d + k, 1);
  this.context = math.zeros(d + k, 1);
  this.setContextAt(id, 1) // arm is perfectly correlated with itself
  var distribution = LinUCB.reward_mapping(id);
  this.reward_distribution = gaussian(distribution.mean, distribution.variance);
};

Arm.prototype.setContextAt = function(idx, val) {
  this.context.subset(math.index(idx, 0), val);
}

Arm.prototype.theta = function() {
  return math.multiply(math.inv(this.A), this.b);
};

Arm.prototype.prediction = function() {
  // console.log(this._prediction_mean() + " " + this._prediction_variance());
  return this._prediction_mean() + this._prediction_variance();
};

Arm.prototype._prediction_mean = function() {
  return math.squeeze(math.multiply(math.transpose(this.theta()), this.context));
}

Arm.prototype._prediction_variance = function() {
  return LinUCB.alpha * Math.sqrt(math.squeeze(math.multiply(math.multiply(math.transpose(this.context), math.inv(this.A)), this.context)));
}

Arm.prototype.reward = function() {
  // returns a sample from gaussian reward distribution
  return this.reward_distribution.ppf(Math.random());
};
