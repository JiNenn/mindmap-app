/**
 * 「ありがとう」リアクション関連のAPI処理
 * シンプルに mindmapId => thankCount のマッピングで管理
 */

let thankCounts = {
    // mindmapId: number
    // e.g. "sample_mindmap_id": 3
  };
  
  exports.getThankCount = (req, res) => {
    const { mindmapId } = req.params;
    const count = thankCounts[mindmapId] || 0;
    return res.json({ mindmapId, count });
  };
  
  exports.addThank = (req, res) => {
    const { mindmapId } = req.body;
  
    if (!mindmapId) {
      return res.status(400).json({ error: 'mindmapId is required' });
    }
  
    // インクリメント
    if (!thankCounts[mindmapId]) {
      thankCounts[mindmapId] = 0;
    }
    thankCounts[mindmapId] += 1;
  
    return res.json({ mindmapId, count: thankCounts[mindmapId] });
  };
  