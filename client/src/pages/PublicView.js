// client/src/pages/PublicView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function PublicView() {
  const { shareId } = useParams();
  const navigate = useNavigate();

  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicMap();
    // eslint-disable-next-line
  }, [shareId]);

  // 公開マップを取得
  const fetchPublicMap = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/mindmaps/public/${shareId}`);
      setMapData(res.data);
    } catch (err) {
      console.error(err);
      setError('このマップは見つからないか、既に非公開になっています。');
    }
  };

  // 複製ボタン押下 → ログインチェック & 複製API呼び出し
  const handleClone = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('マップを複製するにはログインが必要です。ログインページへ移動します。');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/mindmaps/public/${shareId}/clone`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate(`/editor/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('マップの複製に失敗しました');
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.letterCard}>
          <h2 style={styles.title}>エラー</h2>
          <p style={styles.message}>{error}</p>
        </div>
      </div>
    );
  }
  if (!mapData) {
    return (
      <div style={styles.container}>
        <div style={styles.letterCard}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.letterCard}>
        <h2 style={styles.title}>こちらが共有されています</h2>
        <div style={styles.mapInfo}>
          <p style={styles.mapTitle}>{mapData.title}</p>
          <p>ノード数: {mapData.nodes.length}</p>
          <p>エッジ数: {mapData.edges.length}</p>
        </div>
        <button onClick={handleClone} style={styles.cloneButton}>
          このマップを複製する
        </button>
      </div>
    </div>
  );
}

export default PublicView;

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fdf6e3', // パーチメント風の明るい背景
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Georgia, serif'
  },
  letterCard: {
    width: '420px',
    padding: '2rem',
    borderRadius: '8px',
    background: '#fff8e1', // 手紙のような温かみのある色
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    border: '1px solid #f0e6d2'
  },
  title: {
    marginTop: 0,
    marginBottom: '1rem',
    fontSize: '24px',
    color: '#5a4636'
  },
  mapInfo: {
    textAlign: 'left',
    marginBottom: '1.5rem',
    padding: '1rem',
    borderRadius: '4px',
    background: '#fffef7'
  },
  mapTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
    color: '#5a4636'
  },
  cloneButton: {
    background: '#4A90E2',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  message: {
    fontSize: '16px',
    color: '#a94442'
  }
};
