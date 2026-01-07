"use client";
import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Image, X, Loader2 } from "lucide-react";
import {
    useGetAllPostsQuery,
    useCreatePostMutation,
    useReactToPostMutation,
    useAddCommentMutation,
    Post,
} from "@/services/PostService";
import { useGetCurrentUserQuery } from "@/services/UserService";
import formatDateToTime from "@/utils/formatDateToTime";

export default function PostFeed() {
    const [page, setPage] = useState(1);
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

    // Create post modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState(""); // For preview (base64)
    const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null); // For upload
    const [englishTipWord, setEnglishTipWord] = useState("");
    const [englishTipMeaning, setEnglishTipMeaning] = useState("");
    const [englishTipExample, setEnglishTipExample] = useState("");

    // API Hooks
    const { data: postsData, isLoading, isFetching, refetch } = useGetAllPostsQuery({ page, limit: 10 });
    const { data: currentUser } = useGetCurrentUserQuery();
    const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
    const [reactToPost] = useReactToPostMutation();
    const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

    const posts = postsData?.Data?.posts || [];
    const pagination = postsData?.Data?.pagination;

    const handleLike = async (postId: string) => {
        try {
            await reactToPost(postId).unwrap();
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleComment = async (postId: string) => {
        const commentText = commentInputs[postId]?.trim();
        if (!commentText) return;

        try {
            await addComment({ postId, content: commentText }).unwrap();
            setCommentInputs({ ...commentInputs, [postId]: "" });
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const toggleComments = (postId: string) => {
        setShowComments({ ...showComments, [postId]: !showComments[postId] });
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        try {
            await createPost({
                content: newPostContent,
                image: newPostImageFile || undefined, // Pass File for Cloudinary upload
                englishTip: (englishTipWord && englishTipMeaning) ? {
                    word: englishTipWord,
                    meaning: englishTipMeaning,
                    example: englishTipExample || undefined,
                } : undefined
            }).unwrap();

            // Reset form
            setNewPostContent("");
            setNewPostImage("");
            setNewPostImageFile(null);
            setEnglishTipWord("");
            setEnglishTipMeaning("");
            setEnglishTipExample("");
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPostImageFile(file); // Store File for upload
            // Also create base64 for preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPostImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLoadMore = () => {
        if (pagination?.hasMore) {
            setPage(prev => prev + 1);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/20">
            {/* Create Post Section */}
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <div
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
                >
                    <div className="p-4 flex items-center gap-4">
                        <img
                            src={currentUser?.image_url || "https://i.pravatar.cc/150?img=12"}
                            alt="Your avatar"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/30"
                        />
                        <div className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-6 py-3 transition-colors">
                            <p className="text-gray-500">Thêm bài viết...</p>
                        </div>
                        <button className="p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:scale-110 transition-all">
                            <Image className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            {/* Post Header */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={post.user?.image_url || "https://i.pravatar.cc/150"}
                                            alt={post.user?.fullname || post.user?.username}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/30"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {post.user?.fullname || post.user?.username || "Người dùng"}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {formatDateToTime(post.createdDate)}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 pb-3">
                                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                                    {post.content}
                                </p>
                            </div>

                            {/* Post Image */}
                            {post.imageUrl && (
                                <div className="relative w-full aspect-[4/3] bg-gray-100">
                                    <img
                                        src={post.imageUrl}
                                        alt="Post content"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* English Tip Card */}
                            {post.englishTip && (
                                <div className="mx-4 mt-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">💡</span>
                                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                            English Tip
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-green-900 text-lg mb-1">
                                        {post.englishTip.word}
                                    </h4>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Nghĩa:</span> {post.englishTip.meaning}
                                    </p>
                                    {post.englishTip.example && (
                                        <p className="text-sm text-gray-600 italic">
                                            &quot;{post.englishTip.example}&quot;
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="px-4 pt-3 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Like Button */}
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-2 group transition-all"
                                        >
                                            <div className="relative">
                                                <Heart
                                                    className={`w-6 h-6 transition-all duration-300 ${post.isLiked
                                                        ? "fill-red-500 text-red-500 scale-110"
                                                        : "text-gray-700 group-hover:scale-110 group-hover:text-red-500"
                                                        }`}
                                                />
                                                {post.isLiked && (
                                                    <div className="absolute inset-0 animate-ping">
                                                        <Heart className="w-6 h-6 text-red-500 opacity-75" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${post.isLiked ? "text-red-500" : "text-gray-700"}`}>
                                                {post.reactCount}
                                            </span>
                                        </button>

                                        {/* Comment Button */}
                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            className="flex items-center gap-2 group transition-all hover:scale-105"
                                        >
                                            <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-500">
                                                {post.commentCount}
                                            </span>
                                        </button>

                                        {/* Share Button */}
                                        <button className="flex items-center gap-2 group transition-all hover:scale-105">
                                            <Share2 className="w-6 h-6 text-gray-700 group-hover:text-green-500 transition-colors" />
                                        </button>
                                    </div>

                                    {/* Save Button */}
                                    <button className="transition-all hover:scale-110">
                                        <Bookmark className="w-6 h-6 text-gray-700 hover:text-yellow-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {showComments[post.id] && (
                                <div className="border-t border-gray-100 bg-gray-50/50">
                                    {/* Existing Comments */}
                                    <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-3 animate-fadeIn">
                                                    <img
                                                        src={comment.userAvatar || "https://i.pravatar.cc/150"}
                                                        alt={comment.userName}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-sm text-gray-900">
                                                                {comment.userName}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDateToTime(comment.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-800">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 text-sm py-4">
                                                Chưa có bình luận nào. Hãy là người đầu tiên!
                                            </p>
                                        )}
                                    </div>

                                    {/* Comment Input */}
                                    <div className="px-4 py-3 border-t border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={currentUser?.image_url || "https://i.pravatar.cc/150?img=12"}
                                                alt="Your avatar"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Viết bình luận..."
                                                    value={commentInputs[post.id] || ""}
                                                    onChange={(e) =>
                                                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                                                    }
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleComment(post.id);
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-all text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleComment(post.id)}
                                                disabled={!commentInputs[post.id]?.trim() || isCommenting}
                                                className={`p-2 rounded-full transition-all ${commentInputs[post.id]?.trim()
                                                    ? "bg-green-500 hover:bg-green-600 text-white hover:scale-110"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {isCommenting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))
                )}

                {/* Load More */}
                {pagination?.hasMore && (
                    <div className="text-center py-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                        >
                            {isFetching ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang tải...
                                </span>
                            ) : (
                                "Tải thêm bài viết"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Tạo bài viết mới
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={currentUser?.image_url || "https://i.pravatar.cc/150?img=12"}
                                    alt="Your avatar"
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/30"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {currentUser?.fullname || "Bạn"}
                                    </h3>
                                    <p className="text-xs text-gray-500">Đăng công khai</p>
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Bạn muốn chia sẻ điều gì về tiếng Anh hôm nay?"
                                className="w-full min-h-[150px] p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
                            />

                            {/* Image Preview */}
                            {newPostImage && (
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src={newPostImage}
                                        alt="Preview"
                                        className="w-full max-h-96 object-cover"
                                    />
                                    <button
                                        onClick={() => { setNewPostImage(""); setNewPostImageFile(null); }}
                                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                                    >
                                        <X className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            )}

                            {/* Image Upload Button */}
                            <div className="flex items-center gap-3">
                                <label className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-green-400 hover:bg-green-50/50 transition-all">
                                        <Image className="w-6 h-6 text-green-600" />
                                        <span className="text-gray-700 font-medium">
                                            {newPostImage ? "Thay đổi ảnh" : "Thêm ảnh"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* English Tip Section */}
                            <div className="border-2 border-green-200 rounded-2xl p-4 bg-gradient-to-br from-green-50 to-blue-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">💡</span>
                                    <h4 className="font-semibold text-green-900">
                                        Thêm mẹo tiếng Anh (tùy chọn)
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={englishTipWord}
                                        onChange={(e) => setEnglishTipWord(e.target.value)}
                                        placeholder="Từ vựng/Cụm từ (VD: Break the ice)"
                                        className="w-full px-4 py-2 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={englishTipMeaning}
                                        onChange={(e) => setEnglishTipMeaning(e.target.value)}
                                        placeholder="Nghĩa tiếng Việt"
                                        className="w-full px-4 py-2 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={englishTipExample}
                                        onChange={(e) => setEnglishTipExample(e.target.value)}
                                        placeholder="Ví dụ (tùy chọn)"
                                        className="w-full px-4 py-2 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim() || isCreating}
                                className={`px-8 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${newPostContent.trim() && !isCreating
                                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:scale-105"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang đăng...
                                    </>
                                ) : (
                                    "Đăng bài"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
