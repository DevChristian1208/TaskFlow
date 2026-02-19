import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword,
  UserCredential 
} from "firebase/auth";

export async function register(email: string, password: string, name: string) {
  const userCredential =
    await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(userCredential.user, {
    displayName: name,
  });

  await userCredential.user.reload();

  return userCredential;
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}
