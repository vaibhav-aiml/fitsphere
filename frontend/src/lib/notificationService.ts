// Simplified notification service
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return false;
  }
  return true;
}

export async function subscribeToPushNotifications() {
  return true;
}

export async function unsubscribeFromPushNotifications() {
  return true;
}