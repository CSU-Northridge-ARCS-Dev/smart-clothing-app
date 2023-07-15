import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; 

export const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, message: 'User signed up successfully!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
