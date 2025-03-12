/**
 * ローカルストレージに匿名IDを保存し、毎回同じIDを返すヘルパー
 */
export function getAnonymousId() {
    const key = 'my_app_anonymous_id';
    let anonId = localStorage.getItem(key);
  
    if (!anonId) {
      anonId = 'anon-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(key, anonId);
    }
  
    return anonId;
  }
    