// client/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 例: サーバーURL設定
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function Home() {
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // マインドマップ一覧取得
  const fetchMindmaps = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/mindmaps`);
      setMindmaps(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('データを取得できませんでした');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMindmaps();
  }, []);

  // 新規マップ作成
  const handleCreateMindmap = async () => {
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
      const res = await axios.post(`${SERVER_URL}/api/mindmaps`, payload);
      navigate(`/editor/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError('マインドマップの作成に失敗しました');
    }
  };

  // 一覧の各マップ詳細へ飛ぶ
  const handleGoToMap = (mapId) => {
    navigate(`/editor/${mapId}`);
  };

  if (loading) {
    return <div style={{ padding: 20 }}>読み込み中...</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>エラー</h2>
        <p>{error}</p>
        <button onClick={fetchMindmaps}>再読み込み</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <header
        style={{
          background: '#f5f5f5',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ccc'
        }}
      >
        {/* ロゴ or サイト名 */}
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>MindMap App</div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {/* タイトル & 新規作成ボタン */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, marginRight: 20 }}>ホーム</h1>
          <button
            onClick={handleCreateMindmap}
            style={{
              background: '#007BFF',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            新しいマインドマップを作成
          </button>
        </div>

        {/* 補足説明 */}
        <p style={{ marginBottom: 30, lineHeight: '1.6' }}>
          ここでは新しいマインドマップを作成したり、過去に作成したマップを一覧から開くことができます。
          <br />
          「新しいマインドマップを作成」ボタンをクリックすると、すぐに編集画面に移動します。
        </p>

        {/* マップ一覧 */}
        <section>
          <h2 style={{ marginBottom: 10 }}>マインドマップ一覧</h2>
          {mindmaps.length === 0 ? (
            <p>まだマインドマップがありません。上のボタンから作成しましょう。</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              {mindmaps.map((map) => (
                <div
                  key={map.id}
                  style={{
                    border: '2px solid rgb(128, 185, 247)',
                    borderRadius: '4px',
                    padding: '10px',
                    cursor: 'pointer',
                    background: '#fff'
                  }}
                  onClick={() => handleGoToMap(map.id)}
                >
                  <h3 style={{ margin: '0 0 8px' }}>{map.title}</h3>
                  {/* ありがとう数などの補足情報を表示する場合 */}
                  <p style={{ margin: 0, color: '#666' }}>ありがとう数: 0</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* フッター */}
      <footer
        style={{
          background: '#f5f5f5',
          padding: '10px 20px',
          textAlign: 'center',
          borderTop: '1px solid #ccc'
        }}
      >
        <small style={{ color: '#888' }}>
          &copy; 2025 MindMap App. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default Home;
