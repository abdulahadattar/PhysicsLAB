export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  } else {
    return 'denied';
  }
};

export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return 'denied';
  }
  return Notification.permission;
};
