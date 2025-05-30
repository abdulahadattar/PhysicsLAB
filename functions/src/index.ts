import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addChapterMaterial, updateChapterMaterial, addPdfResource, updatePdfResource, deletePdfResource } from "./study_materials";

admin.initializeApp();

/**
 * Cloud Function triggered on user creation.
 * Sets a custom claim 'role' based on the user's email.
 * If the user's email matches the TEACHER_EMAIL environment variable,
 * the role is set to 'teacher'. Otherwise, it's set to 'student'.
 */
export const setUserRole = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const teacherEmail = process.env.TEACHER_EMAIL; // Access environment variable

  if (!email) {
    console.warn(`User created without email: ${user.uid}`);
    // Optionally set a default role or handle as needed
    try {
      await admin.auth().setCustomUserClaims(user.uid, { role: 'student' });
      console.log(`Set default 'student' role for user without email: ${user.uid}`);
    } catch (error) {
      console.error(`Error setting default role for user without email ${user.uid}:`, error);
    }
    return null; // Exit the function
  }

  try {
    if (teacherEmail && email.toLowerCase() === teacherEmail.toLowerCase()) {
      // Set custom claim 'role' to 'teacher'
      await admin.auth().setCustomUserClaims(user.uid, { role: 'teacher' });
      console.log(`Set 'teacher' role for user: ${email} (UID: ${user.uid})`);
    } else {
      // Set custom claim 'role' to 'student'
      await admin.auth().setCustomUserClaims(user.uid, { role: 'student' });
      console.log(`Set 'student' role for user: ${email} (UID: ${user.uid})`);
    }
  } catch (error) {
    console.error(`Error setting custom claims for user ${user.uid}:`, error);
  }

  return null; // Indicate successful execution
});

export {
  addChapterMaterial, updateChapterMaterial, addPdfResource,
  updatePdfResource, deletePdfResource
});