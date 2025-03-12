// client/src/components/MindmapCanvas.js
import React, { useState } from 'react';
import { marked } from 'marked';

const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 80;

function MindmapCanvas({ mindmap, setMindmap }) {
  const [dragging, setDragging] = useState({
    isDragging: false,
    nodeIndex: null,
    offsetX: 0,
    offsetY: 0
  });
  const [isEdgeMode, setIsEdgeMode] = useState(false);
  const [edgeStart, setEdgeStart] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  /**
   * ノードのサイズ更新（ユーザーがリサイズ操作後に呼び出し）
   * ※編集中のノードの場合はサイズ更新しない
   */
  const handleNodeResize = (index, el, scaleFactor = 1.0) => {
    if (editingNodeId === mindmap.nodes[index].nodeId) return;
    const newWidth = el.offsetWidth / scaleFactor;
    const newHeight = el.offsetHeight / scaleFactor;
    const currentNode = mindmap.nodes[index];

    if (currentNode.width !== newWidth || currentNode.height !== newHeight) {
      const newNodes = [...mindmap.nodes];
      newNodes[index] = { ...newNodes[index], width: newWidth, height: newHeight };
      setMindmap({ ...mindmap, nodes: newNodes });
    }
  };

  /**
   * ノードのドラッグ開始（エッジ追加モード／編集中は無効）
   */
  const handleDragStart = (e, index) => {
    if (isEdgeMode || editingNodeId) return;
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragging({ isDragging: true, nodeIndex: index, offsetX, offsetY });
  };

  /**
   * ノードのドラッグ中の座標更新
   */
  const handleMouseMove = (e) => {
    if (!dragging.isDragging) return;
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const newX = e.clientX - containerRect.left + scrollLeft - dragging.offsetX;
    const newY = e.clientY - containerRect.top + scrollTop - dragging.offsetY;
    const newNodes = [...mindmap.nodes];
    newNodes[dragging.nodeIndex] = { ...newNodes[dragging.nodeIndex], x: newX, y: newY };
    setMindmap({ ...mindmap, nodes: newNodes });
  };

  /**
   * ドラッグ終了
   */
  const handleMouseUp = () => {
    if (dragging.isDragging) {
      setDragging({ isDragging: false, nodeIndex: null, offsetX: 0, offsetY: 0 });
    }
  };

  /**
   * ノード追加
   */
  const addNode = () => {
    const newNodeId = `node_${Date.now()}`;
    const newNode = {
      nodeId: newNodeId,
      text: '新しいノード',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT
    };
    setMindmap({ ...mindmap, nodes: [...mindmap.nodes, newNode] });
  };

  /**
   * ノードクリック（エッジモード時のみ動作）
   */
  const handleNodeClick = (node) => {
    if (!isEdgeMode) return;
    if (!edgeStart) {
      setEdgeStart(node.nodeId);
    } else {
      if (edgeStart === node.nodeId) {
        setEdgeStart(null);
      } else {
        const newEdge = {
          id: `edge_${Date.now()}`,
          from: edgeStart,
          to: node.nodeId
        };
        const newEdges = mindmap.edges ? [...mindmap.edges, newEdge] : [newEdge];
        setMindmap({ ...mindmap, edges: newEdges });
        setEdgeStart(null);
      }
    }
  };

  /**
   * エッジクリックで削除確認
   */
  const handleEdgeClick = (edgeId, e) => {
    e.stopPropagation();
    if (window.confirm('この線を削除しますか？')) {
      const newEdges = (mindmap.edges || []).filter((edge) => edge.id !== edgeId);
      setMindmap({ ...mindmap, edges: newEdges });
    }
  };

  /**
   * nodeId からノード情報を取得
   */
  const getNodeById = (nodeId) => mindmap.nodes.find((n) => n.nodeId === nodeId);

  /**
   * ノードをダブルクリックで Markdown 編集モードに切替
   */
  const handleNodeDoubleClick = (node) => {
    if (isEdgeMode) return;
    setEditingNodeId(node.nodeId);
    setEditingText(node.text);
  };

  /**
   * 編集完了：Enter キー（Shift+Enter で改行可能）で Markdown を保存
   */
  const handleEditFinish = (nodeId) => {
    const newNodes = mindmap.nodes.map((node) =>
      node.nodeId === nodeId ? { ...node, text: editingText } : node
    );
    setMindmap({ ...mindmap, nodes: newNodes });
    setEditingNodeId(null);
    setEditingText('');
  };

  /**
   * ノード削除ボタン
   */
  const handleDeleteNode = (index, e) => {
    e.stopPropagation();
    const newNodes = mindmap.nodes.filter((_, idx) => idx !== index);
    setMindmap({ ...mindmap, nodes: newNodes });
  };

  // UI: エッジモード情報
  const edgeModeInfo = isEdgeMode
    ? edgeStart
      ? `エッジ追加中… 開始ノード: ${edgeStart} → 次のノードを選択`
      : 'エッジ追加モード：ノードを選択してください'
    : null;

  return (
    <div style={canvasStyles.container}>
      {/* コントロールバー */}
      <div style={canvasStyles.controlBar}>
        <button style={canvasStyles.controlButton} onClick={addNode}>
          ノード追加
        </button>
        <button
          style={{
            ...canvasStyles.controlButton,
            background: isEdgeMode ? '#dc3545' : '#6c757d'
          }}
          onClick={() => {
            setIsEdgeMode((prev) => !prev);
            setEdgeStart(null);
          }}
        >
          {isEdgeMode ? 'エッジ追加モード解除' : 'エッジ追加モード'}
        </button>
        {edgeModeInfo && <span style={canvasStyles.edgeInfo}>{edgeModeInfo}</span>}
      </div>

      {/* キャンバス領域 */}
      <div
        style={canvasStyles.canvasArea}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* エッジ用 SVG */}
        <svg style={canvasStyles.svgLayer}>
          {(mindmap.edges || []).map((edge) => {
            const fromNode = getNodeById(edge.from);
            const toNode = getNodeById(edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={edge.id}
                x1={fromNode.x + (fromNode.width || DEFAULT_NODE_WIDTH) / 2}
                y1={fromNode.y + (fromNode.height || DEFAULT_NODE_HEIGHT) / 2}
                x2={toNode.x + (toNode.width || DEFAULT_NODE_WIDTH) / 2}
                y2={toNode.y + (toNode.height || DEFAULT_NODE_HEIGHT) / 2}
                stroke="#333"
                strokeWidth="2"
                pointerEvents="visibleStroke"
                onClick={(e) => handleEdgeClick(edge.id, e)}
              />
            );
          })}
        </svg>

        {/* ノード描画 */}
        {mindmap.nodes.map((node, idx) => {
          const isDraggingNode = dragging.isDragging && dragging.nodeIndex === idx;
          const scale = editingNodeId === node.nodeId ? 1.0 : isDraggingNode ? 1.1 : 1.0;

          // ノードごとのスタイル（デフォルト・エッジ接続ありなど）
          let nodeBackground = '#ffffff';
          let textColor = 'black';
          let nodeRadius = '4px';
          if (idx === 0) {
            nodeBackground = '#006400';
            textColor = '#ffffff';
            nodeRadius = '15px';
          } else if (mindmap.edges && mindmap.nodes.length > 0) {
            const fromNodeId = mindmap.nodes[0].nodeId;
            const hasEdgeFromIdx0 = mindmap.edges.some(
              (edge) => edge.from === fromNodeId && edge.to === node.nodeId
            );
            if (hasEdgeFromIdx0) {
              nodeBackground = '#50C878';
              nodeRadius = '4px';
            }
          }

          return (
            <div
              key={node.nodeId}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.width || DEFAULT_NODE_WIDTH,
                height: node.height || DEFAULT_NODE_HEIGHT,
                padding: '8px',
                background: nodeBackground,
                color: textColor,
                border: '1.5px solid #aaa',
                borderRadius: nodeRadius,
                cursor: isEdgeMode ? 'pointer' : 'move',
                userSelect: 'none',
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                resize: 'both',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
              onMouseDown={(e) => handleDragStart(e, idx)}
              onDoubleClick={() => handleNodeDoubleClick(node)}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNodeId(node.nodeId)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onMouseUp={(e) => {
                if (editingNodeId !== node.nodeId) {
                  handleNodeResize(idx, e.currentTarget, scale);
                }
              }}
            >
              {hoveredNodeId === node.nodeId && editingNodeId !== node.nodeId && (
                <div
                  onClick={(e) => handleDeleteNode(idx, e)}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid #ccc',
                    color: 'red',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="ノードを削除"
                >
                  ×
                </div>
              )}
              {editingNodeId === node.nodeId ? (
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEditFinish(node.nodeId);
                    }
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    height: '100%',
                    resize: 'none',
                    border: 'none',
                    outline: 'none',
                    background: 'rgba(255,255,255,0.9)'
                  }}
                />
              ) : (
                <div
                  style={{ width: '100%', height: '100%', overflow: 'hidden', lineHeight: '1.4' }}
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(node.text, { breaks: true })
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MindmapCanvas;

const canvasStyles = {
  container: {
    width: '100%'
  },
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '10px'
  },
  controlButton: {
    background: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  edgeInfo: {
    marginLeft: '10px',
    color: '#555'
  },
  canvasArea: {
    position: 'relative',
    width: '100%',
    height: '630px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'auto'
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }
};
