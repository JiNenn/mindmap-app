// server/controllers/mindmapController.js
const Mindmap = require('../models/mindmapModel');
const { v4: uuidv4 } = require('uuid');

/**
 * 全マインドマップ一覧を取得
 */
const getAllMindmaps = async (req, res) => {
  try {
    const mindmaps = await Mindmap.find();
    return res.json(mindmaps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getMyMindmaps = async (req, res) => {
  try {
    const userId = req.user.id; // verifyToken ミドルウェアが設定している想定
    const myMaps = await Mindmap.find({ owner: userId }).sort({ createdAt: -1 });
    return res.json(myMaps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * マインドマップを作成 (所有者は req.user.id を利用)
 */
const createMindmap = async (req, res) => {
  try {
    const userId = req.user.id; // verifyToken によって設定済み
    const { title, nodes, edges } = req.body;
    const mapId = `mindmap_${uuidv4()}`;
    const newMap = await Mindmap.create({
      id: mapId,
      title: title || '新しいマップ',
      nodes: nodes || [],
      edges: edges || [],
      owner: userId
    });
    return res.status(201).json(newMap);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create mindmap' });
  }
};

/**
 * マインドマップ詳細を取得
 */
const getMindmapById = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Mindmap.findOne({ id });
    if (!found) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(found);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * マインドマップを更新 (所有者のみ)
 */
const updateMindmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const map = await Mindmap.findOne({ id });
    if (!map) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (map.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: not the owner' });
    }
    const { title, nodes, edges } = req.body;
    map.title = title ?? map.title;
    map.nodes = nodes ?? map.nodes;
    map.edges = edges ?? map.edges;
    await map.save();
    return res.json(map);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * マインドマップの複製 (ログインユーザーが所有として複製)
 */
const cloneMindmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const originalMap = await Mindmap.findOne({ id });
    if (!originalMap) {
      return res.status(404).json({ error: 'Not found' });
    }
    const newId = `mindmap_${uuidv4()}`;
    const cloned = await Mindmap.create({
      id: newId,
      title: originalMap.title + ' (複製)',
      nodes: JSON.parse(JSON.stringify(originalMap.nodes)),
      edges: JSON.parse(JSON.stringify(originalMap.edges)),
      owner: userId
    });
    return res.status(201).json(cloned);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * マインドマップを削除 (所有者のみ)
 */
const deleteMindmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const map = await Mindmap.findOne({ id });
    if (!map) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (map.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: not the owner' });
    }
    await map.deleteOne();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    const userId = req.user.id; // verifyToken でセットされる
    const map = await Mindmap.findOne({ id });
    if (!map) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }
    // 所有者チェック: お気に入りは所有者のみ更新する場合
    if (map.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update favorite' });
    }
    map.favorite = favorite;
    await map.save();
    return res.json({ favorite: map.favorite });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ★ 公開リンクを生成 or 更新
const generatePublicLink = async (req, res) => {
  try {
    const { id } = req.params;        // mindmap.id
    const userId = req.user.id;       // verifyToken
    const map = await Mindmap.findOne({ id });
    if (!map) return res.status(404).json({ error: 'Not found' });

    // 所有者チェック
    if (map.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // ランダム文字列を発行して publicShareId に設定
    map.publicShareId = uuidv4();
    map.isPublic = true;
    await map.save();

    // フロントでは /public/:publicShareId を開く想定
    return res.json({
      publicShareId: map.publicShareId,
      url: `/public/${map.publicShareId}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate public link' });
  }
};

// ★ 公開リンクを読み取り (誰でもOK)
const getMapByPublicShareId = async (req, res) => {
  try {
    const { shareId } = req.params; 
    const map = await Mindmap.findOne({ publicShareId: shareId, isPublic: true });
    if (!map) {
      return res.status(404).json({ error: 'Not found or not public' });
    }
    // 読み取り専用として返す
    return res.json(map);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ★ 公開マップを複製 (POST /api/public/:shareId/clone)
const clonePublicMap = async (req, res) => {
  try {
    const { shareId } = req.params;
    // clone先ユーザー
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ error: 'Login required to clone' });
    }

    const original = await Mindmap.findOne({ publicShareId: shareId, isPublic: true });
    if (!original) {
      return res.status(404).json({ error: 'Not found or not public' });
    }

    // 新しい id
    const newId = `mindmap_${uuidv4()}`;
    const cloned = await Mindmap.create({
      id: newId,
      title: `${original.title} (複製)`,
      nodes: JSON.parse(JSON.stringify(original.nodes)),
      edges: JSON.parse(JSON.stringify(original.edges)),
      owner: userId,
      isPublic: false,              // 複製直後は非公開にする
      publicShareId: null           // 複製直後はリンクなし
    });
    return res.status(201).json(cloned);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to clone map' });
  }
};

module.exports = {
  getAllMindmaps,
  getMyMindmaps,
  createMindmap,
  getMindmapById,
  updateMindmap,
  cloneMindmap,
  deleteMindmap,
  updateFavorite,
  generatePublicLink,
  getMapByPublicShareId,
  clonePublicMap
};
