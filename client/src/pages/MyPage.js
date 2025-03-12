// client/src/pages/MyPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function MyPage() {
  const navigate = useNavigate();
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // JWT トークンを localStorage から取得
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
      // お気に入り情報がある場合はそのまま、なければ false
      const dataWithFav = res.data.map((m) => ({ ...m, favorite: m.favorite === true }));
      setMindmaps(dataWithFav);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response ? err.response.data.error : 'エラーが発生しました');
      setLoading(false);
    }
  };

  // 新規マインドマップ作成 → 作成後 Editor へ遷移
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

  // Editor への遷移
  const handleGoEditor = (mapId) => {
    navigate(`/editor/${mapId}`);
  };

  // handleDelete：元のコードをほぼそのまま採用
  const handleDelete = async (mapId) => {
    if (!window.confirm('本当に削除しますか？')) return;
    console.log('handleDelete: mapId=', mapId, ' token=', token);
    try {
      const res = await axios.delete(`${SERVER_URL}/api/mindmaps/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Delete response:', res.data);
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

  // お気に入りトグル：スターアイコンをクリックして切替
  const toggleFavorite = async (mapId, currentFavorite) => {
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/mindmaps/${mapId}/favorite`,
        { favorite: !currentFavorite },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMindmaps((prev) =>
        prev.map((m) => (m.id === mapId ? { ...m, favorite: res.data.favorite } : m))
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
                    color: map.favorite ? 'gold' : '#ccc'
                  }}
                  title="お気に入りに登録 / 解除"
                >
                  {map.favorite ? '★' : '☆'}
                </div>

                {/* マップタイトル */}
                <h3 style={styles.mapTitle} onClick={() => handleGoEditor(map.id)}>
                  {map.title}
                </h3>
                <small style={styles.mapTime}>
                  {new Date(map.createdAt).toLocaleString()}
                </small>

                {/* 削除ボタン（カード右下、お気に入りスターの下） */}
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
        <small style={{ color: '#888' }}>
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
    background: '#6A5D4D', // 背景色を落ち着いた暗いトーンに
    padding: '20px',
    fontFamily: 'Georgia, serif'
  },
  header: {
    background: '#3e372f',
    borderBottom: '2px solid #2b2723',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerTitle: {
    margin: 0,
    color: '#e3d9cc',
    fontSize: '24px'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  createButton: {
    background: '#7b4b28',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  logoutButton: {
    background: '#bb4a43',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  mainArea: {
    flexGrow: 1,
    padding: '20px',
    color: '#e3d9cc'
  },
  noMapsText: {
    color: '#e3d9cc'
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  mapCard: {
    position: 'relative',
    border: '1px solid #2b2723',
    borderRadius: '4px',
    padding: '10px',
    background: '#4a423a',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
    color: '#f0ece9'
  },
  starIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: '20px',
    cursor: 'pointer'
  },
  mapTitle: {
    margin: '0 0 8px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#f0ece9'
  },
  mapTime: {
    color: '#d2c8bc'
  },
  // 削除ボタンをカードの右下に配置
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    background: '#bb4a43',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  footer: {
    background: '#3e372f',
    borderTop: '2px solid #2b2723',
    textAlign: 'center',
    padding: '10px'
  },
  loading: {
    color: '#e3d9cc',
    background: '#1d1915',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Georgia, serif'
  },
  reloadButton: {
    marginTop: '1rem',
    background: '#7b4b28',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
