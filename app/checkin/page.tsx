// app/checkin/page.tsx
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CheckinPage() {
  const [tgTag, setTgTag] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("Default Event");

  useEffect(() => {
    async function fetchEventName() {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "current_event")
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error fetching event name:", error);
      } else if (data) {
        setEventName(data.value);
      }
    }

    fetchEventName();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const tag = tgTag.trim();
    if (!tag || !tag.startsWith("@")) {
      alert("Введите Telegram тег, начиная с @");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from("attendance").insert([
        {
          tg_tag: tag,
          event_name: eventName,
          status: "пришёл",
        },
      ]);

      if (insertError) {
        console.error(insertError);
        alert("Ошибка при сохранении записи.");
        return;
      }

      const { count: total, error: selectError } = await supabase
        .from("attendance")
        .select("id", { count: "exact" })
        .eq("event_name", eventName);

      if (selectError) {
        console.error(selectError);
        alert("Ошибка при получении счёта.");
        return;
      }

      setCount(total ?? 0);
      setTgTag("");
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Отметься, что ты пришёл</h1>
      <p className="mb-4 text-lg">Событие: <span className="font-bold">{eventName}</span></p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="text"
          placeholder="@yourtelegram"
          value={tgTag}
          onChange={(e) => setTgTag(e.target.value)}
          className="border p-2 rounded"
          aria-label="Telegram tag"
        />

        <button type="submit" className="bg-blue-500 text-white rounded p-2" disabled={loading}>
          {loading ? "Отмечаем..." : "Я пришёл"}
        </button>
      </form>

      <p className="mt-4 text-lg">
        Сегодня пришло: <span className="font-bold">{count}</span> человек
      </p>
    </div>
  );
}
