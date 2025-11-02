const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: String,
  coverLetter: String,
  status: { type: String, enum: ['Pending','Reviewed','Accepted','Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Application', applicationSchema);
