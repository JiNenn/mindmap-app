// client/src/pages/Editor.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MindmapCanvas from '../components/MindmapCanvas';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function Editor() {
  const { mindmapId } = useParams();
  const navigate = useNavigate();

  const [mindmap, setMindmap] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);

  // ありがとうカウント
  const [thankCount, setThankCount] = useState(0);
  const [thankDisabled, setThankDisabled] = useState(false);

  // メッセージ用 state
  const [copyMessage, setCopyMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // ログイン用トークン
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('ログインが必要です');
      navigate('/login');
      return;
    }
    if (mindmapId) {
      fetchMindmap();
      fetchThankCount();
    }
    // eslint-disable-next-line
  }, [mindmapId]);

  const fetchMindmap = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/mindmaps/${mindmapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMindmap(res.data);
      setTitle(res.data.title);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response ? err.response.data.error : err.message);
      setMindmap(null);
    }
  };

  const fetchThankCount = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/thank/${mindmapId}`);
      setThankCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!mindmap) return;
    try {
      await axios.put(
        `${SERVER_URL}/api/mindmaps/${mindmap.id}`,
        { title, nodes: mindmap.nodes, edges: mindmap.edges },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSaveMessage('保存しました！');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        showSaveMessage('他人のマップです。編集権限がありません', true);
      } else {
        showSaveMessage('保存に失敗しました', true);
      }
    }
  };

  const handleSendThank = async () => {
    if (thankDisabled) return;
    try {
      await axios.post(`${SERVER_URL}/api/thank`, { mindmapId });
      await fetchThankCount();
      showCopyMessage('お礼を伝えました！');
      setThankDisabled(true);
      setTimeout(() => {
        setThankDisabled(false);
      }, 60000);
    } catch (err) {
      console.error(err);
      showCopyMessage('失敗しました', true);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!mindmap) return;
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/mindmaps/${mindmap.id}/public`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fullUrl = window.location.origin + res.data.url; 
      await navigator.clipboard.writeText(fullUrl);
      showCopyMessage('公開リンクをコピーしました！');
    } catch (err) {
      console.error(err);
      showCopyMessage('公開リンクの生成に失敗しました', true);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showCopyMessage('リンクをコピーしました');
    });
  };

  const handleGoHome = () => {
    navigate('/mypage');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const showCopyMessage = (msg) => {
    setCopyMessage(msg);
    setTimeout(() => setCopyMessage(''), 1500);
  };

  const showSaveMessage = (msg, isError = false) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleTitleDoubleClick = () => setIsEditingTitle(true);
  const handleTitleBlur = () => setIsEditingTitle(false);
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') setIsEditingTitle(false);
  };

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>エラー</h1>
        <p>{error}</p>
        <button onClick={fetchMindmap}>再取得</button>
      </div>
    );
  }
  if (!mindmap) {
    return <div style={{ padding: 20 }}>読み込み中...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <button onClick={handleGoHome} style={styles.homeButton}>
          ←
        </button>

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            style={styles.titleInput}
          />
        ) : (
          <h2
            onDoubleClick={handleTitleDoubleClick}
            style={styles.titleH2}
            title="ダブルクリックでタイトルを編集できます"
          >
            {title}
          </h2>
        )}

        <button onClick={handleGeneratePublicLink} style={styles.shareButton}>
          公開リンク
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          ログアウト
        </button>
      </header>

      {copyMessage && <div style={styles.messageBox}>{copyMessage}</div>}

      <main style={styles.mainArea}>
        <div style={styles.thankArea}>
          <div style={styles.thankCount}>{thankCount}</div>
          <button
            onClick={handleSendThank}
            disabled={thankDisabled}
            style={{
              ...styles.thankButton,
              background: thankDisabled ? '#e0e0e0' : '#f0f0f0',
              cursor: thankDisabled ? 'not-allowed' : 'pointer'
            }}
            title="ありがとうを送る（1分間に一度のみ送れます）"
          >
            ↑
          </button>
          <div style={{ marginLeft: 50 }}>
            <small style={styles.titleNote}>
              ※タイトルをダブルクリックで編集できます
            </small>
          </div>
        </div>

        {/* キャンバス領域を中央配置し、サイズ拡大 */}
        <div style={styles.canvasWrapper}>
          <MindmapCanvas mindmap={mindmap} setMindmap={setMindmap} />
        </div>

        {saveMessage && <div style={styles.messageBox}>{saveMessage}</div>}

        <div style={styles.buttonRow}>
          <button onClick={handleSave} style={styles.saveButton}>
            保存
          </button>
          <button
            onClick={() => navigate(`/export/${mindmap.id}`)}
            style={styles.exportButton}
          >
            Markdownに変換
          </button>
        </div>
      </main>

      <footer style={styles.footer}>
        <small style={{ color: '#666' }}>
          &copy; 2025 MindMap App. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default Editor;

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f5e8d3', // 薄い茶色の背景（木の板を連想）
    fontFamily: 'Georgia, serif'
  },
  header: {
    padding: '10px 20px',
    background: '#f7f1e7', // やや明るめの茶色
    borderBottom: '1px solid #e0d4c2',
    display: 'flex',
    alignItems: 'center'
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: '#5e4b3c', // 落ち着いたダークブラウン
    color: '#fff',
    fontSize: '20px',
    marginRight: 10,
    cursor: 'pointer'
  },
  titleInput: {
    fontSize: '24px',
    flexGrow: 1,
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '4px 8px'
  },
  titleH2: {
    flexGrow: 1,
    margin: 0,
    fontSize: '24px',
    cursor: 'text'
  },
  shareButton: {
    marginLeft: 10,
    border: 'none',
    background: '#7a6d64', // 落ち着いたブラウン系
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  logoutButton: {
    marginLeft: 10,
    border: 'none',
    background: '#bb4a43',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
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
    padding: '20px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  thankArea: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    maxWidth: '1000px'
  },
  thankCount: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginRight: 10,
    color: '#5e4b3c'
  },
  thankButton: {
    border: '1px solid #ccc',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '18px'
  },
  titleNote: {
    color: '#666',
    marginLeft: 50
  },
  canvasWrapper: {
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: '1200px', // キャンバスサイズを大きく
    height: '700px',
    overflow: 'auto',
    marginBottom: 20,
    background: '#fff', // 明るいキャンバス背景
    borderRadius: '4px'
  },
  buttonRow: {
    display: 'flex',
    gap: '10px'
  },
  saveButton: {
    background: '#5e4b3c', // 落ち着いたダークブラウン
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  exportButton: {
    background: '#7a6d64', // 同系色の控えめな色
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  footer: {
    background: '#f7f1e7',
    borderTop: '1px solid #e0d4c2',
    padding: '10px 20px',
    textAlign: 'center'
  }
};
