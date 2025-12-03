// src/api/categories.js
// Category-related API functions

import { supabase } from "../lib/supabaseClient";

/**
 * GET ALL CATEGORIES
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * GET CATEGORY BY ID
 */
export const getCategoryById = async (categoryId) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET CATEGORY WITH PRODUCT COUNT
 */
export const getCategoriesWithCount = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      items(count)
      `
    )
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    data?.map((cat) => ({
      ...cat,
      productCount: cat.items?.[0]?.count || 0,
    })) || []
  );
};

/**
 * CREATE CATEGORY (Admin only)
 */
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      id: categoryData.id,
      name: categoryData.name,
      emoji: categoryData.emoji,
      description: categoryData.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE CATEGORY (Admin only)
 */
export const updateCategory = async (categoryId, updates) => {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * DELETE CATEGORY (Admin only)
 */
export const deleteCategory = async (categoryId) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
  return true;
};
