// server/models/mindmapModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  nodeId: String,
  text: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number
});

const EdgeSchema = new Schema({
  id: String,
  from: String,
  to: String
});
const MindmapSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  favorite: { type: Boolean, default: false },  // 追加
  createdAt: { type: Date, default: Date.now },
  publicShareId: { type: String, default: null },
  isPublic: { type: Boolean, default: false }
});

module.exports = mongoose.model('Mindmap', MindmapSchema);
