import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/HistoryCSS.css";

const PLATFORM_ICONS = {
  linkedin: "💼",
  x: "✦",
  instagram: "📸",
};

const History = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts on page load
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Saved Posts</h1>
        <p>All your saved AI-generated content in one place.</p>
      </div>

      {loading ? (
        <div className="history-empty">Loading saved posts...</div>
      ) : posts.length === 0 ? (
        <div className="history-empty">No saved posts yet.</div>
      ) : (
        <div className="history-grid">
          {posts.map((post) => (
            <div className="history-card" key={post.id}>
              <div className="history-card-header">
                <span className="history-platform">
                  {PLATFORM_ICONS[post.platform] || "🌐"} {post.platform}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => deletePost(post.id)}
                >
                  🗑 Delete
                </button>
              </div>

              <div className="history-content">
                {post.content}
              </div>

              <div className="history-footer">
                Saved on {new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;