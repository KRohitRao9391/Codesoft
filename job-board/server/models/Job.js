const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jobSchema = new Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  category: String,
  type: String,
  salary: String,
  description: String,
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Job', jobSchema);
