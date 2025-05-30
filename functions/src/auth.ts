import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const teacherEmails = ['teacher1@example.com', 'teacher2@example.com']; // Placeholder list

export const assignTeacherRole = functions.auth.user().onCreate(async (user) => {
  const email = user.email;

  if (email && teacherEmails.includes(email)) {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { role: 'teacher' });
      console.log(`Successfully assigned teacher role to user ${user.uid} with email ${email}`);
    } catch (error) {
      console.error(`Error assigning teacher role to user ${user.uid}:`, error);
    }
  } else {
    console.log(`User ${user.uid} with email ${email} is not a teacher.`);
  }
});