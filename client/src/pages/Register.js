import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 一時的なメッセージ表示ヘルパー
  const showMessage = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${SERVER_URL}/api/auth/register`, { username, password });
      showMessage('ユーザー登録が完了しました！');
      setTimeout(() => {
        navigate('/login'); // 登録完了後、ログインページへ遷移
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        showMessage(err.response.data.error, true);
      } else {
        showMessage('登録に失敗しました', true);
      }
    }
  };

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '1rem' }}>ユーザー登録</h2>

        {/* 成功 or エラーメッセージ */}
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

        <form onSubmit={handleRegister} style={styles.form}>
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

          <button type="submit" style={styles.registerButton}>
            登録
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={handleGoLogin} style={styles.linkButton}>
            ログインはこちら
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;

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
  registerButton: {
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
