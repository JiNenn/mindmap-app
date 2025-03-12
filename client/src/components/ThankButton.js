// client/src/components/ThankButton.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// SNSで匿名IDを管理する場合などがあれば下記を使う（必要なら）
// import { getAnonymousId } from '../utils/anonymousId';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function ThankButton({ mindmapId }) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [thankCount, setThankCount] = useState(0);

  const fetchThankCount = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/thank/${mindmapId}`);
      setThankCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThankCount();
  }, [mindmapId]);

  const handleThank = async () => {
    if (isDisabled) return;
    setIsDisabled(true);
    try {
      // もし匿名IDが必要なら以下のように付与する
      // const anonymousId = getAnonymousId();
      await axios.post(`${SERVER_URL}/api/thank`, { mindmapId /*, anonymousId */ });
      await fetchThankCount();
      alert('ありがとうを送りました！');
      // 1分間（60000ms）ボタンを無効化
      setTimeout(() => {
        setIsDisabled(false);
      }, 60000);
    } catch (err) {
      console.error(err);
      setIsDisabled(false);
    }
  };

  return (
    <div>
      <button onClick={handleThank} disabled={isDisabled}>
        {isDisabled ? '1分間お待ちください' : 'ありがとうを送る'}
      </button>
      <p>現在のありがとう数: {thankCount}</p>
    </div>
  );
}

export default ThankButton;
