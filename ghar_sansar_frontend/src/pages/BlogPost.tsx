// src/pages/BlogPost.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, Sparkles, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogs } from "../context/BlogContext";
import toast from "react-hot-toast";

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading, error } = useBlogs();

  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#D9B4A4] border-t-[#7D3219] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-24 text-center px-4">
        <p className="text-red-600 text-sm mb-4">Error loading post: {error}</p>
        <Link
          to="/blog"
          className="px-4 py-2 bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] rounded-md text-xs font-medium"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  const post = blogs.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-24 text-center px-4">
        <h2 className="text-xl font-poppins font-normal text-gray-950 mb-2">Post not found</h2>
        <p className="text-xs text-gray-500 mb-4">The blog story doesn’t exist or has been removed.</p>
        <Link
          to="/blog"
          className="px-4 py-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-md text-xs font-medium inline-block shadow-2xs"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  const extractYouTubeId = (url?: string) => {
    if (!url) return "";
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  };

  const isYouTube = post.video?.includes("youtube") || post.video?.includes("youtu.be");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-16 sm:pt-20 pb-16 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 mb-6 font-normal">
          <Link to="/" className="hover:text-stone-900 transition-colors cursor-pointer">
            Home
          </Link>
          <span className="text-stone-300">/</span>
          <Link to="/blog" className="hover:text-stone-900 transition-colors cursor-pointer">
            Design Journal
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-medium truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-normal text-stone-600 hover:text-stone-950 mb-4 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to All Stories</span>
        </Link>

        {/* Main Article Container */}
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-[#E8E2D8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden"
        >
          {/* Media Header */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] max-h-[460px] bg-black">
            {post.video && isYouTube ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractYouTubeId(post.video)}?autoplay=0&rel=0`}
                title={post.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            ) : post.video ? (
              <video
                src={post.video}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            ) : post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#FAF8F5] text-stone-400">
                <Sparkles size={32} />
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              {post.features && post.features[0] && (
                <span className="text-[10.5px] font-medium uppercase tracking-wider text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2.5 py-0.5 rounded-md">
                  {post.features[0]}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-gray-400" />
                <span>Ghar Sansar Studio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                <span>{new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                <span>Quick Read</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7D3219] hover:underline cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          {/* Title & Body */}
          <div className="p-5 sm:p-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-poppins font-normal text-gray-950 leading-tight mb-4">
              {post.title}
            </h1>
            <div className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-line space-y-3">
              <p>{post.description}</p>
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        <div className="mt-10">
          <h2 className="text-lg sm:text-xl font-poppins font-normal text-gray-950 mb-4">
            More Design Stories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blogs
              .filter((b) => b.id !== post.id)
              .slice(0, 2)
              .map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.id}`}
                  className="group bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] shadow-2xs hover:shadow-[0_12px_28px_rgba(125,50,25,0.06)] hover:-translate-y-0.5 transition-all p-3.5 flex gap-3.5 items-center cursor-pointer"
                >
                  <div className="w-20 h-16 sm:w-24 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E8E2D8]">
                    {related.video ? (
                      <img
                        src={`https://img.youtube.com/vi/${extractYouTubeId(related.video)}/hqdefault.jpg`}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : related.image ? (
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-poppins text-xs sm:text-[13px] font-normal text-gray-950 line-clamp-2 leading-snug group-hover:text-[#7D3219] transition-colors mb-1">
                      {related.title}
                    </h3>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1 font-normal">
                      {related.description}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogPost;
