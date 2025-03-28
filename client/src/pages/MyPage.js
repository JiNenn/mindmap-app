// MyPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function MyPage() {
  const navigate = useNavigate();
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('ログインが必要です');
      navigate('/login');
      return;
    }
    fetchMyMindmaps();
    // eslint-disable-next-line
  }, [token]);

  const fetchMyMindmaps = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/mindmaps/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataWithFav = res.data.map((m) => ({ ...m, favorite: m.favorite === true }));
      setMindmaps(dataWithFav);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response ? err.response.data.error : 'エラーが発生しました');
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const newId = `mindmap_${Date.now()}`;
      const payload = {
        id: newId,
        title: '新しいマップ',
        nodes: [
          {
            nodeId: `node_${Date.now()}`,
            text: 'テーマ',
            x: 300,
            y: 150
          }
        ]
      };
      const res = await axios.post(`${SERVER_URL}/api/mindmaps`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/editor/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('マインドマップの作成に失敗しました');
    }
  };

  const handleGoEditor = (mapId) => {
    navigate(`/editor/${mapId}`);
  };

  const handleDelete = async (mapId) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await axios.delete(`${SERVER_URL}/api/mindmaps/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMindmaps((prev) => prev.filter((m) => m.id !== mapId));
    } catch (err) {
      console.error('削除エラー:', err);
      if (err.response) {
        if (err.response.status === 403) {
          alert('削除に失敗しました: 他人のマップです。編集権限がありません。');
        } else {
          alert(`削除に失敗しました: ${err.response.data.error || '不明なエラー'}`);
        }
      } else {
        alert('削除に失敗しました');
      }
    }
  };

  const toggleFavorite = async (mapId, currentFavorite) => {
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/mindmaps/${mapId}/favorite`,
        { favorite: !currentFavorite },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMindmaps((prev) =>
        prev.map((m) =>
          m.id === mapId ? { ...m, favorite: res.data.favorite } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert('お気に入りの更新に失敗しました');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // タイトルが全角換算で12文字を超える場合、適切な位置で切り捨てて「…」を追加する関数
  const getDisplayTitle = (title) => {
    if (!title) return '';
    
    let widthCount = 0;
    let cutIndex = title.length;
    
    for (let i = 0; i < title.length; i++) {
      // 半角は0.5、全角は1とカウント
      widthCount += title[i].match(/[^\x00-\xff]/) ? 1 : 0.5;
      
      // 全角12文字を超えたらそこで切る
      if (widthCount > 12) {
        cutIndex = i;
        break;
      }
    }
  
    // 切り捨てる必要がある場合は、指定位置までの文字列＋「…」を返す
    if (cutIndex < title.length) {
      return title.substring(0, cutIndex) + '…';
    }
    return title;
  };
  

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }
  if (error) {
    return (
      <div style={styles.loading}>
        <h2>エラー</h2>
        <p>{error}</p>
        <button style={styles.reloadButton} onClick={fetchMyMindmaps}>
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>My Mindmaps</h1>
        <div style={styles.headerButtons}>
          <button style={styles.createButton} onClick={handleCreateNew}>
            新規マインドマップ作成
          </button>
          <button style={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ：マップ一覧 */}
      <main style={styles.mainArea}>
        {mindmaps.length === 0 ? (
          <p style={styles.noMapsText}>
            マインドマップがありません。上の「新規マインドマップ作成」ボタンから作成してください。
          </p>
        ) : (
          <div style={styles.gridWrapper}>
            {mindmaps.map((map) => (
              <div key={map.id} style={styles.mapCard}>
                {/* お気に入りスター（カード右上） */}
                <div
                  onClick={() => toggleFavorite(map.id, map.favorite)}
                  style={{
                    ...styles.starIcon,
                    color: map.favorite ? '#f5c518' : '#ccc'
                  }}
                  title="お気に入りに登録 / 解除"
                >
                  {map.favorite ? '★' : '☆'}
                </div>

                {/* タイトル（長い場合は切り詰め） */}
                <h3
                  style={styles.mapTitle}
                  onClick={() => handleGoEditor(map.id)}
                >
                  {getDisplayTitle(map.title)}
                </h3>

                <small style={styles.mapTime}>
                  {new Date(map.createdAt).toLocaleString()}
                </small>

                {/* 削除ボタン（カード右下） */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(map.id);
                  }}
                  style={styles.deleteButton}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer style={styles.footer}>
        <small style={{ color: '#666' }}>
          &copy; 2025 MindMap App. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default MyPage;

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#f7f7f7',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #ccc',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerTitle: {
    margin: 0,
    color: '#333',
    fontSize: '24px'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  createButton: {
    background: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  logoutButton: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  mainArea: {
    flexGrow: 1,
    padding: '20px',
    color: '#333'
  },
  noMapsText: {
    color: '#333'
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  mapCard: {
    position: 'relative',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    color: '#333'
  },
  starIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: '20px',
    cursor: 'pointer'
  },
  // タイトルが改行されるようにする
  mapTitle: {
    margin: '0 0 8px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#333',
    whiteSpace: 'pre-wrap',   // 改行を反映
    wordWrap: 'break-word'    // 単語途中でも改行を許可
  },
  mapTime: {
    color: '#666'
  },
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    background: 'rgb(187, 74, 67)',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  footer: {
    background: '#fff',
    borderTop: '1px solid #ccc',
    textAlign: 'center',
    padding: '10px'
  },
  loading: {
    color: '#333',
    background: '#f7f7f7',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  reloadButton: {
    marginTop: '1rem',
    background: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
