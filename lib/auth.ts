import { auth, db, storage } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInAnonymously,
  getAdditionalUserInfo,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  UserCredential
} from "firebase/auth";
import { ref as dbRef, remove } from "firebase/database";
import { ref as storageRef, deleteObject } from "firebase/storage";
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

export async function reauthenticate(password: string) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("no-email-user");

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([
    promise.catch(() => {}),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]);
}

export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const paths = user.isAnonymous
    ? ["guestTasks", "guestBoards", "guestContacts", "guestCategories"]
    : ["tasks", "boards", "contacts", "categories"];

  await Promise.all(paths.map((p) => remove(dbRef(db, `${p}/${uid}`))));

  if (!user.isAnonymous) {
    await withTimeout(
      deleteObject(storageRef(storage, `avatars/${uid}/avatar`)),
      5000
    );
  }

  await deleteUser(user);
}
