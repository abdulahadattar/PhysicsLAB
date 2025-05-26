import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, checkNotificationPermission } from './lib/notifications';
import { updateAssignmentData, getLastPracticeDate } from './data/mockAssignments';

function App() {
  const [notificationPermission, setNotificationPermission] = useState(checkNotificationPermission());
  const [showNotificationRequest, setShowNotificationRequest] = useState(false);
  const [showDailyReminder, setShowDailyReminder] = useState(false);

  useEffect(() => {
    // Check notification permission on mount
    const permission = checkNotificationPermission();
    setNotificationPermission(permission);

    // If permission is not granted, show the request prompt after a delay
    if (permission !== 'granted' && permission !== 'denied') {
      setTimeout(() => setShowNotificationRequest(true), 3000); // Show after 3 seconds
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    setShowNotificationRequest(false); // Hide the prompt
  };

  const handleAssignmentUpdate = async () => {
    await updateAssignmentData('physics-101-lab-report', 'student123'); // Example
    // Check for daily reminder
    const lastPractice = getLastPracticeDate();
    if (lastPractice) {
      const lastPracticeDate = new Date(lastPractice);
      const now = new Date();
      const diff = now.getTime() - lastPracticeDate.getTime();
      const daysSinceLastPractice = diff / (1000 * 60 * 60 * 24);

      if (daysSinceLastPractice >= 1) {
        setShowDailyReminder(true);
      }
    } else {
      setShowDailyReminder(true); // First time practice
    }
  };

  useEffect(() => {
    if (showDailyReminder) {
      alert("🔥 Time for your daily PhysicsLab practice! Keep your streak alive!");
      setShowDailyReminder(false); // Only show once
    }
  }, [showDailyReminder]);

  return (
    <div>
      {/* ... your app content ... */}
      {showNotificationRequest && (
        <div className="notification-request">
          <p>Want friendly reminders to practice physics and ace your exams?</p>
          <button onClick={handleRequestNotificationPermission}>
            Enable Notifications
          </button>
        </div>
      )}
      <button onClick={handleAssignmentUpdate}>
        Update Assignment (Simulate Practice)
      </button>
    </div>
  );
}

export default App;
