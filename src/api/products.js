// src/api/products.js
// Product-related API functions

import { supabase } from "../lib/supabaseClient";

/**
 * GET ALL PRODUCTS
 * Fetch products with optional filters and pagination
 */
export const getProducts = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("items")
    .select("*", { count: "exact" });

  // Apply filters
  if (filters.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.searchTerm) {
    query = query.or(
      `name.ilike.%${filters.searchTerm}%,brand.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
    );
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.minRating) {
    query = query.gte("rating", filters.minRating);
  }

  // Sort options
  const sortMap = {
    popular: { column: "rating", ascending: false },
    price_low: { column: "price", ascending: true },
    price_high: { column: "price", ascending: false },
    newest: { column: "created_at", ascending: false },
  };

  const sortConfig = sortMap[filters.sort] || sortMap.popular;
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    products: data || [],
    total: count || 0,
    page,
    limit,
  };
};

/**
 * GET PRODUCT BY ID
 * Fetch detailed product information
 */
export const getProductById = async (productId) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET PRODUCTS BY CATEGORY
 */
export const getProductsByCategory = async (categoryId, limit = 10) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category_id", categoryId)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * SEARCH PRODUCTS
 * Full-text search across products
 */
export const searchProducts = async (searchTerm, limit = 20) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .or(
      `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    )
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * GET FEATURED PRODUCTS
 * Products to display on homepage
 */
export const getFeaturedProducts = async (limit = 10) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .gte("rating", 4.0)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * GET DISCOUNTED PRODUCTS
 * Products with the highest discounts
 */
export const getDiscountedProducts = async (limit = 10) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .gt("discount", 0)
    .order("discount", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * GET PRODUCT REVIEWS
 */
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles (id, display_name)
      `,
      { count: "exact" }
    )
    .eq("item_id", productId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    reviews: data || [],
    total: count || 0,
    page,
    limit,
  };
};

/**
 * ADD PRODUCT REVIEW
 */
export const addProductReview = async (userId, productId, reviewData) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      item_id: productId,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET SIMILAR PRODUCTS
 * Get products in same category
 */
export const getSimilarProducts = async (productId, limit = 8) => {
  // First get the product to find its category
  const product = await getProductById(productId);

  if (!product) throw new Error("Product not found");

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", productId)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * CHECK PRODUCT STOCK
 */
export const checkProductStock = async (productId) => {
  const { data, error } = await supabase
    .from("items")
    .select("id, stock")
    .eq("id", productId)
    .single();

  if (error) throw new Error(error.message);
  return data?.stock || 0;
};

/**
 * UPDATE PRODUCT STOCK (Admin only)
 */
export const updateProductStock = async (productId, newStock) => {
  const { data, error } = await supabase
    .from("items")
    .update({ stock: newStock })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
