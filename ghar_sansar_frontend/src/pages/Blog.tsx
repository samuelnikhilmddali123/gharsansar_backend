import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Play, X, ExternalLink, Sparkles, Video, Image as ImageIcon } from "lucide-react";
import { useBlogs, Blog as BlogItem } from "../context/BlogContext";

const YOUTUBE_CHANNEL = "https://www.youtube.com/@gharsansar_shop";

// Helper to extract YouTube ID from standard or shorts URLs
const extractYouTubeId = (url?: string) => {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
};

const Blog: React.FC = () => {
  const { blogs, loading } = useBlogs();
  const [activeTab, setActiveTab] = useState<"all" | "videos" | "photos">("all");
  const [selectedPost, setSelectedPost] = useState<BlogItem | null>(null);

  // Categorize posts
  const videoPosts = useMemo(() => {
    return blogs.filter(
      (p) =>
        p.video &&
        (/\.(mp4|webm|ogg)(\?|$)/i.test(p.video) ||
          p.video.includes("youtube.com") ||
          p.video.includes("youtu.be"))
    );
  }, [blogs]);

  const imagePosts = useMemo(() => {
    return blogs.filter((p) => !p.video && p.image);
  }, [blogs]);

  const displayedPosts = useMemo(() => {
    if (activeTab === "videos") return videoPosts;
    if (activeTab === "photos") return imagePosts;
    return blogs;
  }, [blogs, videoPosts, imagePosts, activeTab]);

  const getYoutubeEmbedUrl = (url?: string, autoplay: boolean = true) => {
    const vid = extractYouTubeId(url);
    if (!vid) return "";
    return `https://www.youtube.com/embed/${vid}?autoplay=${autoplay ? "1" : "0"}&rel=0&modestbranding=1`;
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-16 sm:pt-20 pb-16 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 mb-6 font-normal">
          <Link to="/" className="hover:text-stone-900 transition-colors cursor-pointer">Home</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-medium">Design Journal</span>
        </nav>

        {/* Editorial Text-Only Header (No top banner images, clean and uncluttered) */}
        <div className="pb-6 border-b border-[#E8E2D8] mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] sm:text-xs font-medium tracking-[0.24em] text-[#7D3219] uppercase font-sans mb-1.5 block">
              Inspiration & Stories • Studio Journal
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-normal text-gray-950 tracking-tight mb-2">
              Design Inspiration & Ideas
            </h1>
            <p className="text-xs sm:text-sm text-[#736B63] max-w-2xl font-normal leading-relaxed">
              Explore room transformation shorts, creative home styling walkthroughs, and curated design ideas crafted by our studio specialists.
            </p>
          </div>

          {/* Social YouTube Channel Badge (Subtle, Not Oversized) */}
          <div className="shrink-0">
            <a
              href={YOUTUBE_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-[#7D3219]" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Watch on YouTube @gharsansar_shop</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shadow-2xs ${
              activeTab === "all"
                ? "bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] shadow-xs"
                : "bg-white hover:bg-[#FAF7F2] text-[#4A433D] hover:text-[#7D3219] border border-[#E8E2D8]"
            }`}
          >
            All Stories ({blogs.length})
          </button>

          {videoPosts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                activeTab === "videos"
                  ? "bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] shadow-xs"
                  : "bg-white hover:bg-[#FAF7F2] text-[#4A433D] hover:text-[#7D3219] border border-[#E8E2D8]"
              }`}
            >
              <Video size={13} />
              <span>Video Reels ({videoPosts.length})</span>
            </button>
          )}

          {imagePosts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                activeTab === "photos"
                  ? "bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] shadow-xs"
                  : "bg-white hover:bg-[#FAF7F2] text-[#4A433D] hover:text-[#7D3219] border border-[#E8E2D8]"
              }`}
            >
              <ImageIcon size={13} />
              <span>Articles & Photos ({imagePosts.length})</span>
            </button>
          )}
        </div>

        {/* Content State */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D9B4A4] border-t-[#7D3219] animate-spin"></div>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E2D8] p-8 shadow-2xs">
            <p className="text-gray-500 text-sm font-normal">No stories currently found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-14">
            {displayedPosts.map((post, index) => {
              const isYouTube = post.video?.includes("youtube") || post.video?.includes("youtu.be");
              const hasVideo = Boolean(post.video);

              return (
                <motion.div
                  key={post.id || `post-${index}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#D9B4A4] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(125,50,25,0.06)] hover:-translate-y-1 transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Media Preview Box */}
                    <div className="relative w-full aspect-[16/10] sm:aspect-[9/13] max-h-[300px] rounded-xl overflow-hidden bg-[#FAF7F2] mb-3 border border-[#E8E2D8]/80">
                      {hasVideo ? (
                        isYouTube ? (
                          <div className="relative w-full h-full bg-black/5 flex items-center justify-center">
                            {/* YouTube Thumbnail if available or player */}
                            <img
                              src={`https://img.youtube.com/vi/${extractYouTubeId(post.video)}/hqdefault.jpg`}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              onError={(e) => {
                                // Fallback if YouTube thumbnail 404s
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play size={16} className="text-[#7D3219] fill-[#7D3219] ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
                              <Play size={9} className="fill-white" /> Reel
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full h-full bg-black">
                            <video
                              src={post.video}
                              muted
                              playsInline
                              loop
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                              Video
                            </span>
                          </div>
                        )
                      ) : post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#FAF8F5]">
                          <Sparkles size={24} className="opacity-40 text-stone-400" />
                        </div>
                      )}
                    </div>

                    {/* Features Tag */}
                    {post.features && post.features[0] && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2 py-0.5 rounded-md mb-2 inline-block">
                        {post.features[0]}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="font-poppins text-sm sm:text-[15px] font-normal text-gray-950 mb-1 leading-snug line-clamp-2 group-hover:text-[#7D3219] transition-colors">
                      {post.title}
                    </h3>

                    {/* Description */}
                    {post.description && (
                      <p className="text-xs text-[#6B7280] font-normal leading-relaxed line-clamp-2 mb-3">
                        {post.description}
                      </p>
                    )}
                  </div>

                  {/* Micro-Curved Secondary Card Action */}
                  <div className="pt-2.5 border-t border-[#E8E2D8] mt-2">
                    <button
                      type="button"
                      className="w-full py-1.5 px-3 bg-[#FAF7F2] group-hover:bg-[#F7EBE4] text-[#7D3219] border border-[#E8E2D8] group-hover:border-[#D9B4A4] text-xs font-poppins font-medium rounded-md shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {hasVideo ? (
                        <>
                          <Play size={11} className="fill-current text-[#7D3219]" />
                          <span>Watch Story</span>
                        </>
                      ) : (
                        <span>Read Full Story</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Video / Story Detail Modal */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl border border-[#E8E2D8] shadow-2xl max-w-2xl w-full p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="absolute right-4 top-4 w-7 h-7 rounded-md border border-[#E8E2D8] bg-[#FAF7F2] hover:bg-white text-gray-500 hover:text-black flex items-center justify-center transition cursor-pointer z-10"
                  aria-label="Close modal"
                >
                  <X size={15} />
                </button>

                {/* Media Embed */}
                <div className="w-full aspect-[16/9] sm:aspect-[16/10] rounded-lg overflow-hidden bg-black mb-4 border border-[#E8E2D8]">
                  {selectedPost.video ? (
                    selectedPost.video.includes("youtube") || selectedPost.video.includes("youtu.be") ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(selectedPost.video, true)}
                        title={selectedPost.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <video
                        src={selectedPost.video}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )
                  ) : selectedPost.image ? (
                    <img
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>

                {/* Features Tag */}
                {selectedPost.features && selectedPost.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedPost.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium uppercase tracking-wider text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2 className="font-poppins text-lg sm:text-xl font-normal text-gray-950 mb-2 leading-snug">
                  {selectedPost.title}
                </h2>

                {/* Full Description */}
                {selectedPost.description && (
                  <p className="text-xs sm:text-[13px] text-[#6B7280] font-normal leading-relaxed whitespace-pre-line mb-4">
                    {selectedPost.description}
                  </p>
                )}

                {/* Modal Footer Link */}
                <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-3">
                  <a
                    href={YOUTUBE_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#7D3219] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>More updates on our channel</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-md text-xs font-medium transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Blog;
