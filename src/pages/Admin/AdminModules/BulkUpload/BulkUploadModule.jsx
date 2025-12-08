// src/pages/Admin/AdminModules/BulkUpload/BulkUploadModule.jsx

import React, { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function BulkUploadModule() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult("");
    setLoading(true);

    const reader = new FileReader();

    reader.onload = async (ev) => {
      try {
        const text = ev.target.result;

        // ------------------------------
        // CLEAN & PREPARE CSV LINES
        // ------------------------------
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length <= 1) {
          setResult("CSV appears empty.");
          setLoading(false);
          return;
        }

        const header = lines[0]
          .split(",")
          .map((h) => h.trim().toLowerCase());

        // ------------------------------
        // MAP CATEGORIES FROM SUPABASE
        // ------------------------------
        const { data: categories, error: catErr } = await supabase
          .from("categories")
          .select("id, name");

        if (catErr) {
          console.error("Category fetch error:", catErr);
          setResult("Unable to load categories.");
          setLoading(false);
          return;
        }

        const categoryMap = {};
        (categories || []).forEach((c) => {
          categoryMap[c.name.trim().toLowerCase()] = c.id;
        });

        // ------------------------------
        // PARSE PRODUCTS
        // ------------------------------
        const newProducts = [];
        let added = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim());
          const row = {};

          header.forEach((h, idx) => {
            row[h] = cols[idx] || "";
          });

          if (!row.name) continue;

          const tags = row.tags
            ? row.tags.split("|").map((t) => t.trim()).filter(Boolean)
            : [];

          const variants = row.variants
            ? row.variants.split("|").map((v) => v.trim()).filter(Boolean)
            : [];

          const categoryName = (row.category || "").toLowerCase();
          const category_id = categoryMap[categoryName] || null;

          const now = new Date().toISOString();

          newProducts.push({
            name: row.name,
            brand: row.brand || "Seva Sanjeevani",
            price: Number(row.price || 0),
            stock: Number(row.stock || 0),
            description: row.description || "",
            category_id,
            tags,
            variants,
            image_url:
              row["image url"] ||
              row.imageurl ||
              row.imageUrl ||
              row.image ||
              "",
            image_data: "",
            created_at: now,
            updated_at: now,
          });

          added++;
        }

        if (added === 0) {
          setResult("No valid products found.");
          setLoading(false);
          return;
        }

        // ------------------------------
        // INSERT IN BATCHES (Safety for 1k limit)
        // ------------------------------
        const batchSize = 500;
        for (let i = 0; i < newProducts.length; i += batchSize) {
          const batch = newProducts.slice(i, i + batchSize);

          const { error } = await supabase.from("items").insert(batch);
          if (error) {
            console.error("Bulk insert error:", error);
            setResult("Failed to insert products. Some rows may be invalid.");
            setLoading(false);
            return;
          }
        }

        pushActivity(`Bulk uploaded ${added} product(s) via CSV`, "success");
        setResult(`✅ Successfully added ${added} product(s).`);
      } catch (err) {
        console.error("CSV Parse Error:", err);
        setResult("❌ Failed to parse CSV file.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">
        Bulk Upload Products (CSV)
      </h3>

      <div className="rounded-xl border border-slate-700 p-4 bg-slate-950/80 text-xs">
        <p className="mb-2 text-slate-400">Upload CSV file with structure:</p>

        <pre className="bg-slate-900 p-2 rounded text-[0.65rem] overflow-x-auto">
name,brand,price,category,description,stock,tags,variants,imageUrl
Ashwagandha,Seva,499,Immunity,Stress support,100,"immunity|stress","60 caps|120 caps",https://...
        </pre>

        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
        />

        {loading && (
          <p className="mt-2 text-slate-400 text-xs">Uploading… please wait</p>
        )}

        {result && (
          <p className="mt-2 text-emerald-300 text-xs">{result}</p>
        )}
      </div>
    </div>
  );
}
