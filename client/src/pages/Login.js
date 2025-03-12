// client/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // エラー or 成功メッセージを表示するためのステート
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 一時的にメッセージを表示し、数秒後に消すヘルパー関数
  const showMessage = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/login`, { username, password });
      // JWT トークンを localStorage に保存
      localStorage.setItem('token', res.data.token);
      // メッセージを表示し、2秒後にマイページへ遷移
      showMessage('ログイン成功！');
      setTimeout(() => {
        navigate('/mypage'); // ログイン成功時のリダイレクト先
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        showMessage(err.response.data.error, true);
      } else {
        showMessage('ログインに失敗しました', true);
      }
    }
  };

  const handleGoRegister = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '1rem' }}>ログイン</h2>

        {/* 成功 or エラー メッセージ */}
        {message && (
          <div
            style={{
              ...styles.messageBox,
              background: isError ? '#f8d7da' : '#d4edda',
              color: isError ? '#721c24' : '#155724'
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label>ユーザー名</label>
            <input
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>パスワード</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.loginButton}>
            ログイン
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={handleGoRegister} style={styles.linkButton}>
            ユーザー登録はこちら
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

// シンプルなインラインCSS例
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f2f2f2'
  },
  card: {
    width: '350px',
    padding: '2rem',
    borderRadius: '6px',
    background: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  loginButton: {
    padding: '10px 0',
    background: '#007BFF',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007BFF',
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  messageBox: {
    padding: '10px',
    marginBottom: '1rem',
    borderRadius: '4px',
    fontWeight: 'bold'
  }
};
