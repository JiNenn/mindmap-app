// client/src/pages/ExportMarkdown.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';
const MAX_DEPTH = 7;

function ExportMarkdown() {
  const { mindmapId } = useParams();
  const navigate = useNavigate();

  const [mindmap, setMindmap] = useState(null);
  const [markdownText, setMarkdownText] = useState('');
  const [copyMode, setCopyMode] = useState(false);
  const [error, setError] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (mindmapId) {
      fetchMindmap();
    }
    // eslint-disable-next-line
  }, [mindmapId]);

  useEffect(() => {
    if (mindmap) {
      const numberedNodes = buildNumberedTree(mindmap);
      const md = convertToMarkdown(numberedNodes);
      setMarkdownText(md);
    }
  }, [mindmap]);

  const fetchMindmap = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/mindmaps/${mindmapId}`);
      setMindmap(res.data);
    } catch (err) {
      console.error(err);
      setError('マインドマップを取得できませんでした');
    }
  };

  // ------------------------------------------------
  // ツリー構築 & Markdown生成
  // ------------------------------------------------

  const buildNumberedTree = (mapData) => {
    const { nodes, edges } = mapData;
    if (!nodes || nodes.length === 0) return [];

    // ノードID -> インバウンド数
    const inboundCountMap = {};
    nodes.forEach((node) => {
      inboundCountMap[node.nodeId] = 0;
    });
    edges?.forEach((edge) => {
      if (inboundCountMap[edge.to] != null) {
        inboundCountMap[edge.to]++;
      }
    });

    // ルートノード判定
    const rootNodes = nodes.filter((n) => inboundCountMap[n.nodeId] === 0);
    const rootNode = rootNodes[0] || nodes[0];
    if (!rootNode) return [];

    // ノードID -> ノード
    const nodeMap = {};
    nodes.forEach((nd) => {
      nodeMap[nd.nodeId] = nd;
    });

    // 親 -> 子ノードID のマップ
    const childrenMap = {};
    nodes.forEach((nd) => {
      childrenMap[nd.nodeId] = [];
    });
    edges?.forEach((edge) => {
      if (childrenMap[edge.from]) {
        childrenMap[edge.from].push(edge.to);
      }
    });
    Object.keys(childrenMap).forEach((key) => {
      childrenMap[key].sort((a, b) => {
        const idxA = nodes.findIndex((n) => n.nodeId === a);
        const idxB = nodes.findIndex((n) => n.nodeId === b);
        return idxA - idxB;
      });
    });

    const result = [];
    const dfs = (nodeId, numbering) => {
      const depth = numbering.split('.').length;
      if (depth > MAX_DEPTH) return;
      const nodeObj = nodeMap[nodeId];
      if (!nodeObj) return;

      result.push({ numbering, text: nodeObj.text || '' });
      const childs = childrenMap[nodeId] || [];
      childs.forEach((childId, index) => {
        const newNumber = `${numbering}.${index + 1}`;
        dfs(childId, newNumber);
      });
    };
    dfs(rootNode.nodeId, '1');
    return result;
  };

  const convertToMarkdown = (numberedNodes) => {
    let md = '';
    numberedNodes.forEach((item) => {
      const level = item.numbering.split('.').length;
      md += `${'#'.repeat(level)} ${item.numbering}\n`;
      md += `${item.text}\n\n`;
    });
    return md.trim();
  };

  // ------------------------------------------------
  // コピー関連
  // ------------------------------------------------
  const showCopyMessage = () => {
    setCopyMessage('コピーしました');
    setTimeout(() => {
      setCopyMessage('');
    }, 1500);
  };

  const handleCopySection = (sectionText) => {
    navigator.clipboard.writeText(sectionText).then(() => {
      showCopyMessage();
    });
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdownText).then(() => {
      showCopyMessage();
    });
  };

  // ------------------------------------------------
  // RenderMarkdown
  // ------------------------------------------------
  const renderMarkdownWithCopy = (md) => {
    const lines = md.split('\n');
    const sections = [];
    let currentSection = [];
    lines.forEach((line) => {
      if (line.startsWith('#')) {
        if (currentSection.length > 0) {
          sections.push(currentSection);
        }
        currentSection = [line];
      } else {
        currentSection.push(line);
      }
    });
    if (currentSection.length > 0) {
      sections.push(currentSection);
    }

    return sections.map((sectionLines, idx) => {
      const sectionText = sectionLines.join('\n');
      if (!copyMode) {
        return (
          <div
            key={idx}
            style={{ marginBottom: '1em' }}
            dangerouslySetInnerHTML={{ __html: marked.parse(sectionText, { breaks: true }) }}
          />
        );
      }
      return (
        <div
          key={idx}
          style={{
            cursor: 'pointer',
            marginBottom: '1em',
            padding: '10px',
            borderRadius: '4px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={() => handleCopySection(sectionText)}
          dangerouslySetInnerHTML={{ __html: marked.parse(sectionText, { breaks: true }) }}
        />
      );
    });
  };

  // ------------------------------------------------
  // UI: ナビゲーション用
  // ------------------------------------------------
  const handleBackToEditor = () => {
    navigate(`/editor/${mindmap.id}`);
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>エラー</h2>
          <p style={styles.cardText}>{error}</p>
        </div>
      </div>
    );
  }
  if (!mindmap) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.navLeft}>
          <button onClick={handleBackToEditor} style={styles.navButton}>
            ←マップへ
          </button>
        </div>
        <h3 style={styles.headerTitle}>{mindmap.title} - Export</h3>
        <div style={styles.navRight}>
          <button
            onClick={() => setCopyMode(!copyMode)}
            style={{
              ...styles.navButton,
              background: copyMode ? '#dc3545' : '#6c757d'
            }}
          >
            {copyMode ? 'コピーモードOFF' : 'コピーモード'}
          </button>
          <button onClick={handleCopyAll} style={styles.copyAllButton}>
            全てコピー
          </button>
        </div>
      </header>

      {/* コピー時のメッセージ */}
      {copyMessage && <div style={styles.messageBox}>{copyMessage}</div>}

      {/* メインコンテンツ */}
      <main style={styles.mainArea}>{renderMarkdownWithCopy(markdownText)}</main>

      {/* フッター */}
      <footer style={styles.footer}>
        <small style={styles.footerText}>
          &copy; 2025 MindMap App. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default ExportMarkdown;

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#ffffff', // シンプルな明るい背景
    fontFamily: 'Georgia, serif'
  },
  header: {
    padding: '10px 20px',
    background: '#f8f8f8',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  navButton: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  copyAllButton: {
    background: '#4A90E2', // 落ち着いたブルー（全コピー用）
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px'
  },
  messageBox: {
    background: '#daf5da',
    color: '#155724',
    padding: '10px',
    margin: '10px 20px',
    borderRadius: '4px',
    textAlign: 'center'
  },
  mainArea: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px'
  },
  footer: {
    background: '#f8f8f8',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
    padding: '10px 20px'
  },
  footerText: {
    color: '#888'
  },
  // 以下は、MindmapCanvas.js 内のキャンバス領域用スタイルの参考（こちらは各コンポーネント内で独自に設定）
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  cardTitle: {
    fontSize: '24px',
    color: '#333'
  },
  cardText: {
    fontSize: '16px',
    color: '#666'
  },
  container: {
    padding: 20,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
