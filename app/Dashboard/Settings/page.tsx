"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/Context/AuthContext";
import { useBoards } from "@/lib/Context/BoardContext";
import { auth, db } from "@/lib/firebase";
import { deleteAccount, reauthenticate } from "@/lib/auth";
import { updateProfile, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import {
  ACCENT_COLORS,
  applyAccentColor,
  getStoredAccentColor,
} from "@/components/AccentColorEffect";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Palette,
  Bell,
  LayoutGrid,
  Download,
  LogOut,
  KeyRound,
  Check,
  Sun,
  Moon,
  Laptop,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { boards, createBoard, renameBoard, deleteBoard } = useBoards();
  const router = useRouter();

  const isGuest = (user as any)?.isGuest;

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [accent, setAccent] = useState(ACCENT_COLORS[0].value);
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    setName(user?.displayName || "");
    setAccent(getStoredAccentColor());

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, [user?.displayName]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser || !name.trim()) return;

    await updateProfile(auth.currentUser, { displayName: name.trim() });
    refreshUser();
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  function chooseAccent(hex: string) {
    setAccent(hex);
    applyAccentColor(hex);
  }

  function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then(setNotifPermission);
  }

  async function handleRenameBoard(id: string) {
    if (!renameValue.trim()) return;
    await renameBoard(id, renameValue.trim());
    setRenamingId(null);
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    await createBoard(newBoardName.trim());
    setNewBoardName("");
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/Login");
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);

    try {
      if (!isGuest) {
        await reauthenticate(deletePassword);
      }
      await deleteAccount();
      if (user?.uid) {
        localStorage.removeItem(`taskflow_active_board_${user.uid}`);
      }
      router.replace("/Login");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setDeleteError("Passwort ist falsch.");
      } else {
        setDeleteError("Löschen fehlgeschlagen. Bitte erneut versuchen.");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function exportData() {
    if (!user?.uid) return;
    setExporting(true);

    const paths = isGuest
      ? {
          tasks: `guestTasks/${user.uid}`,
          contacts: `guestContacts/${user.uid}`,
          categories: `guestCategories/${user.uid}`,
          boards: `guestBoards/${user.uid}`,
        }
      : {
          tasks: `tasks/${user.uid}`,
          contacts: `contacts/${user.uid}`,
          categories: `categories/${user.uid}`,
          boards: `boards/${user.uid}`,
        };

    try {
      const entries = await Promise.all(
        Object.entries(paths).map(async ([key, path]) => {
          const snap = await get(ref(db, path));
          return [key, snap.exists() ? snap.val() : {}] as const;
        })
      );

      const data = Object.fromEntries(entries);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taskflow-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-background text-foreground space-y-6 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
        Einstellungen
      </h1>

      {isGuest && (
        <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">
            <div className="flex-1">
              <p className="font-medium">Du bist als Gast angemeldet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Deine Daten bleiben nur in diesem Browser gespeichert.
                Registriere dich, um sie dauerhaft zu sichern.
              </p>
            </div>
            <Link
              href="/Register"
              className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple text-center"
            >
              Jetzt registrieren
            </Link>
          </CardContent>
        </Card>
      )}

      {!isGuest && (
        <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shadow-apple-sm">
                {user?.photoURL && (
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                )}
                <AvatarFallback className="text-xl font-semibold bg-accent text-accent-foreground">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <form onSubmit={saveName} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple"
                >
                  Speichern
                </button>
                {nameSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <Check size={15} /> Gespeichert
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <CardTitle>Erscheinungsbild</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Design
            </label>
            <div className="mt-1.5 flex gap-1 p-1 rounded-full bg-muted max-w-xs">
              {[
                { value: "light", label: "Hell", icon: Sun },
                { value: "dark", label: "Dunkel", icon: Moon },
                { value: "system", label: "System", icon: Laptop },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-medium transition-all duration-200 ease-apple ${
                      theme === opt.value
                        ? "bg-card text-foreground shadow-apple-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={13} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Akzentfarbe
            </label>
            <div className="mt-2 flex gap-3 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => chooseAccent(c.value)}
                  title={c.name}
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-150 ease-apple hover:scale-110"
                  style={{ backgroundColor: c.value }}
                >
                  {accent === c.value && (
                    <Check size={18} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <CardTitle>Benachrichtigungen</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {notifPermission === "granted"
              ? "Erinnerungen bei anstehenden Fälligkeiten sind aktiviert."
              : notifPermission === "denied"
              ? "Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen erlauben."
              : notifPermission === "unsupported"
              ? "Dein Browser unterstützt keine Benachrichtigungen."
              : "Erhalte eine Erinnerung, wenn Tasks überfällig oder heute fällig sind."}
          </p>
          {notifPermission === "default" && (
            <button
              onClick={requestNotifications}
              className="shrink-0 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple"
            >
              Aktivieren
            </button>
          )}
          {notifPermission === "granted" && (
            <Check size={18} className="text-green-500 shrink-0" />
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <CardTitle>Boards verwalten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {boards.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-accent transition-colors duration-150 ease-apple"
            >
              {renamingId === b.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRenameBoard(b.id);
                    }
                  }}
                  onBlur={() => handleRenameBoard(b.id)}
                  className="flex-1 h-9 rounded-lg border border-border px-2 bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <span className="flex-1 text-sm truncate">{b.name}</span>
              )}

              {renamingId !== b.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(b.id);
                      setRenameValue(b.name);
                    }}
                    className="text-muted-foreground hover:text-foreground p-1.5"
                  >
                    <Pencil size={14} />
                  </button>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteBoard(b.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <form onSubmit={handleCreateBoard} className="flex items-center gap-2 pt-2">
            <input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Neues Board…"
              className="flex-1 h-10 rounded-xl border border-border px-3 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple text-sm"
            />
            <button
              type="submit"
              disabled={!newBoardName.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors duration-150 ease-apple"
            >
              <Plus size={16} />
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <CardTitle>Daten</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Alle Tasks, Kontakte, Kategorien und Boards als JSON-Datei
            herunterladen.
          </p>
          <button
            onClick={exportData}
            disabled={exporting}
            className="shrink-0 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:bg-accent transition-colors duration-200 ease-apple disabled:opacity-50"
          >
            {exporting ? "Exportiere…" : "Exportieren"}
          </button>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-2xl shadow-apple-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
            <LogOut className="h-5 w-5" />
          </div>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isGuest && (
            <Link
              href="/ResetPass"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-apple"
            >
              <KeyRound size={15} /> Passwort ändern
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-destructive hover:opacity-70 transition-opacity duration-200 ease-apple"
          >
            <LogOut size={15} /> Abmelden
          </button>

          <button
            onClick={() => {
              setDeletePassword("");
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            className="flex items-center gap-2 text-sm text-destructive hover:opacity-70 transition-opacity duration-200 ease-apple"
          >
            <Trash2 size={15} /> Konto löschen
          </button>
        </CardContent>
      </Card>

      {showDeleteModal && (
        <div
          onClick={() => !deleting && setShowDeleteModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleDeleteAccount}
            className="glass-strong border border-border p-6 sm:p-8 rounded-3xl w-[440px] max-w-[92vw] space-y-4 shadow-apple-xl animate-in fade-in zoom-in-95 duration-200 ease-apple"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                Konto löschen
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              {isGuest
                ? "Dein Gast-Konto und alle zugehörigen Daten (Tasks, Boards, Kontakte, Kategorien) werden unwiederbringlich gelöscht."
                : "Dein Konto und alle zugehörigen Daten (Tasks, Boards, Kontakte, Kategorien, Profilbild) werden unwiederbringlich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."}
            </p>

            {!isGuest && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Passwort zur Bestätigung
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-2xl border border-border px-4 bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow duration-200 ease-apple"
                />
              </div>
            )}

            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors duration-200 ease-apple disabled:opacity-50"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                disabled={deleting}
                className="px-4 py-2 rounded-full bg-destructive text-white shadow-apple-sm hover:opacity-90 transition-opacity duration-200 ease-apple disabled:opacity-50"
              >
                {deleting ? "Lösche…" : "Endgültig löschen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
