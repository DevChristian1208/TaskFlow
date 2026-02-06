"use client";

import { useEffect, useState } from "react";
import { UserPlus, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/Context/AuthContext";
import { ref, set, push, onValue, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  color: string;
  createdAt: number;
};

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [showDetailMobile, setShowDetailMobile] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const COLORS = [
    "#6f6fff",
    "#ff9f43",
    "#1dd1a1",
    "#54a0ff",
    "#ff6b6b",
    "#f368e0",
    "#00d2d3",
    "#a55eea",
  ];

  useEffect(() => {
    if (!user?.uid) return;

    return onValue(ref(db, `contacts/${user.uid}`), (snap) => {
      if (!snap.exists()) {
        setContacts([]);
        setSelectedContact(null);
        setLoading(false);
        return;
      }

      const data = snap.val();
      const list: Contact[] = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      list.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(list);
      setSelectedContact((prev: Contact | null) => prev ?? list[0]);
      setLoading(false);
    });
  }, [user]);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;

    const userContactsRef = ref(db, `contacts/${user.uid}`);
    await push(userContactsRef, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
    });

    setName("");
    setEmail("");
    setPhone("");
    setOpenCreate(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid || !selectedContact) return;

    await update(ref(db, `contacts/${user.uid}/${selectedContact.id}`), {
      name,
      email,
      phone,
      color: selectedContact.color,
    });

    setOpenEdit(false);
  }

  async function deleteContact(id: string) {
    if (!user?.uid) return;
    await remove(ref(db, `contacts/${user.uid}/${id}`));
    setSelectedContact(null);
    setShowDetailMobile(false);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[360px_1fr] bg-background">
      <div className="border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <button
            onClick={() => setOpenCreate(true)}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-medium flex items-center justify-center gap-3"
          >
            Add new contact <UserPlus />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {loading ? (
            <p className="text-muted-foreground text-center mt-10">
              Loading...
            </p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedContact(c);
                  setShowDetailMobile(true);
                }}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer mb-2 transition ${
                  selectedContact?.id === c.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:block p-12 bg-muted">
        {selectedContact && (
          <div className="max-w-xl">
            <div className="flex items-center gap-6 mb-8">
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-semibold text-white"
                style={{ backgroundColor: selectedContact.color }}
              >
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-4xl font-semibold">
                  {selectedContact.name}
                </h2>

                <div className="flex gap-6 mt-3 text-muted-foreground">
                  <button
                    onClick={() => {
                      setName(selectedContact.name);
                      setEmail(selectedContact.email);
                      setPhone(selectedContact.phone || "");
                      setOpenEdit(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Pencil size={18} /> Edit
                  </button>

                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg mb-6">{selectedContact.email}</p>

            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-lg">{selectedContact.phone || "—"}</p>
          </div>
        )}
      </div>

      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={createContact}
            className="bg-card p-8 rounded-3xl w-[420px] space-y-4"
          >
            <h2 className="text-2xl font-semibold">Create Contact</h2>

            <input
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-xl border border-border px-4 bg-background"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl border border-border px-4 bg-background"
            />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 rounded-xl border border-border px-4 bg-background"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
