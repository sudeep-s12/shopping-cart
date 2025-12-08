// src/pages/Admin/AdminModules/Seo/SeoModule.jsx

import React, { useEffect, useState } from "react";
import Field from "../../../../components/admin/Field";
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function SeoModule() {
  const [meta, setMeta] = useState({
    title: "",
    description: "",
    keywords: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  // Load SEO metadata from DB
  useEffect(() => {
    const fetchMeta = async () => {
      const { data, error } = await supabase
        .from("seo_meta")
        .select("*")
        .eq("id", 1)
        .single();

      if (error || !data) {
        console.warn("⚠️ No SEO meta found. Using defaults.");
        setMeta({
          title: "Seva Sanjeevani • Ayurveda for everyday wellness",
          description:
            "Shop Ayurveda products, herbal supplements, oils, and wellness essentials curated by Seva Sanjeevani.",
          keywords: "ayurveda, herbal, wellness, immunity, seva sanjeevani",
        });
      } else {
        setMeta({
          title: data.title || "",
          description: data.description || "",
          keywords: data.keywords || "",
        });
      }

      setLoading(false);
    };

    fetchMeta();
  }, []);

  // Save SEO metadata manually
  const saveSEO = async () => {
    setSaving(true);
    setMessage("");

    const payload = {
      id: 1,
      title: meta.title.trim(),
      description: meta.description.trim(),
      keywords: meta.keywords.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("seo_meta")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      console.error("SEO save failed:", error);
      setMessage("❌ Failed to save SEO settings");
      return;
    }

    pushActivity("Updated SEO metadata", "success");
    setMessage("✅ SEO settings saved!");
  };

  if (loading) {
    return <p className="text-xs text-slate-400">Loading SEO settings...</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-100">SEO & Meta Settings</h3>

      <div className="rounded-xl border border-slate-700 p-4 bg-slate-950/80 text-xs">

        {/* Title */}
        <Field
          label="Site title"
          value={meta.title}
          onChange={(e) => update("title", e.target.value)}
        />

        {/* Description */}
        <div className="mt-3">
          <label className="text-[0.7rem] text-slate-400">Meta description</label>
          <textarea
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
            value={meta.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        {/* Keywords */}
        <Field
          label="Keywords (comma separated)"
          value={meta.keywords}
          onChange={(e) => update("keywords", e.target.value)}
        />

        {/* Save Button */}
        <button
          onClick={saveSEO}
          className="mt-3 px-4 py-2 bg-emerald-500 rounded-lg text-slate-900 text-xs font-semibold"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save SEO Settings"}
        </button>

        {/* Feedback */}
        {message && (
          <p className="mt-1 text-[0.7rem] text-emerald-300">{message}</p>
        )}

        <p className="mt-2 text-[0.65rem] text-slate-500">
          These values are stored in the <strong>seo_meta</strong> table and used for meta tags.
        </p>
      </div>
    </div>
  );
}
