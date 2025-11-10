// app/admin/page.tsx
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentEvent();
    }
  }, [isAuthenticated]);

  async function fetchCurrentEvent() {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "current_event")
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching event name:", error);
      alert("Ошибка при загрузке текущего события.");
    } else if (data) {
      setEventName(data.value);
    } else {
      setEventName("Default Event");
    }
  }

  async function handleAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthLoading(true);

    // Note: In a real app, you'd hash passwords and use proper auth
    // This is a simple implementation for demo purposes
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Неверный пароль.");
    }

    setAuthLoading(false);
  }

  async function handleUpdateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!eventName.trim()) {
      alert("Введите название события.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "current_event", value: eventName.trim() }, { onConflict: "key" });

      if (error) {
        console.error(error);
        alert("Ошибка при сохранении.");
      } else {
        alert("Событие обновлено!");
      }
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-4">Админ-панель</h1>
        <form onSubmit={handleAuth} className="flex flex-col gap-3 w-80">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white rounded p-2" disabled={authLoading}>
            {authLoading ? "Проверяем..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Управление событием</h1>
      <form onSubmit={handleUpdateEvent} className="flex flex-col gap-3 w-80">
        <input
          type="text"
          placeholder="Название события"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded p-2" disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
