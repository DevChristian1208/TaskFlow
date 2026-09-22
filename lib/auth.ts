import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInAnonymously,
  getAdditionalUserInfo,
  UserCredential
} from "firebase/auth";
import { seedGuestDemoData } from "./guestSeed";

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

export async function guestLogin() {
  const credential = await signInAnonymously(auth);

  if (getAdditionalUserInfo(credential)?.isNewUser) {
    await seedGuestDemoData(credential.user.uid);
  }

  return credential;
}
