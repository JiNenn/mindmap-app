import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function MindmapCard({ mindmap }) {
  const [thankCount, setThankCount] = useState(0);

  const fetchThankCount = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/thank/${mindmap.id}`);
      setThankCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThankCount();
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
      <h2>{mindmap.title}</h2>
      <p>ありがとう数: {thankCount}</p>
      <Link to={`/editor/${mindmap.id}`}>編集へ</Link>
    </div>
  );
}

export default MindmapCard;
