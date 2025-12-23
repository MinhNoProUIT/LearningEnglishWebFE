"use client";
import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Image, X } from "lucide-react";

interface Comment {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
}

interface Post {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    timestamp: string;
    content: string;
    image?: string;
    likes: number;
    isLiked: boolean;
    isSaved: boolean;
    comments: Comment[];
    englishTip?: {
        word: string;
        meaning: string;
        example: string;
    };
}

const SAMPLE_POSTS: Post[] = [
    {
        id: 1,
        userId: 1,
        userName: "Sarah Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        timestamp: "2 giờ trước",
        content: "Just learned this amazing idiom today! 🎉 'Break the ice' means to make people feel more comfortable in a social situation. Have you used this phrase before?",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
        likes: 124,
        isLiked: false,
        isSaved: false,
        comments: [
            {
                id: 1,
                userId: 2,
                userName: "Mike Chen",
                userAvatar: "https://i.pravatar.cc/150?img=2",
                text: "Great tip! I use this all the time at networking events 😊",
                timestamp: "1 giờ trước"
            }
        ],
        englishTip: {
            word: "Break the ice",
            meaning: "Phá vỡ sự im lặng, tạo không khí thoải mái",
            example: "He told a joke to break the ice at the meeting."
        }
    },
    {
        id: 2,
        userId: 3,
        userName: "Emma Wilson",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        timestamp: "5 giờ trước",
        content: "Today's vocabulary: RESILIENCE 💪\n\nMeaning: The ability to recover quickly from difficulties\nVietnamese: Khả năng phục hồi, sức bền bỉ\n\nExample: 'Her resilience helped her overcome many challenges in life.'\n\nWhat challenges have you shown resilience in?",
        image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&h=600&fit=crop",
        likes: 89,
        isLiked: true,
        isSaved: true,
        comments: [
            {
                id: 2,
                userId: 4,
                userName: "David Park",
                userAvatar: "https://i.pravatar.cc/150?img=3",
                text: "Love this word! Very useful for IELTS writing",
                timestamp: "3 giờ trước"
            },
            {
                id: 3,
                userId: 5,
                userName: "Lisa Nguyen",
                userAvatar: "https://i.pravatar.cc/150?img=4",
                text: "Thank you for sharing! 📚",
                timestamp: "2 giờ trước"
            }
        ],
        englishTip: {
            word: "Resilience",
            meaning: "Khả năng phục hồi, sức bền bỉ",
            example: "Her resilience helped her overcome many challenges."
        }
    },
    {
        id: 3,
        userId: 6,
        userName: "John Smith",
        userAvatar: "https://i.pravatar.cc/150?img=7",
        timestamp: "1 ngày trước",
        content: "Common mistake alert! ⚠️\n\n❌ 'I am boring'\n✅ 'I am bored'\n\n'Boring' = you make others feel bored\n'Bored' = you feel bored\n\nDon't confuse -ing and -ed adjectives! What other pairs do you know?",
        likes: 256,
        isLiked: false,
        isSaved: false,
        comments: [
            {
                id: 4,
                userId: 7,
                userName: "Anna Lee",
                userAvatar: "https://i.pravatar.cc/150?img=6",
                text: "This is so helpful! I always made this mistake 😅",
                timestamp: "12 giờ trước"
            }
        ]
    }
];

export default function PostFeed() {
    const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

    // Create post modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState("");
    const [englishTipWord, setEnglishTipWord] = useState("");
    const [englishTipMeaning, setEnglishTipMeaning] = useState("");
    const [englishTipExample, setEnglishTipExample] = useState("");

    const handleLike = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    const handleSave = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return { ...post, isSaved: !post.isSaved };
            }
            return post;
        }));
    };

    const handleComment = (postId: number) => {
        const commentText = commentInputs[postId]?.trim();
        if (!commentText) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                const newComment: Comment = {
                    id: post.comments.length + 1,
                    userId: 999,
                    userName: "You",
                    userAvatar: "https://i.pravatar.cc/150?img=12",
                    text: commentText,
                    timestamp: "Vừa xong"
                };
                return {
                    ...post,
                    comments: [...post.comments, newComment]
                };
            }
            return post;
        }));

        setCommentInputs({ ...commentInputs, [postId]: "" });
    };

    const toggleComments = (postId: number) => {
        setShowComments({ ...showComments, [postId]: !showComments[postId] });
    };

    const handleCreatePost = () => {
        if (!newPostContent.trim()) return;

        const newPost: Post = {
            id: posts.length + 1,
            userId: 999,
            userName: "You",
            userAvatar: "https://i.pravatar.cc/150?img=12",
            timestamp: "Vừa xong",
            content: newPostContent,
            image: newPostImage || undefined,
            likes: 0,
            isLiked: false,
            isSaved: false,
            comments: [],
            englishTip: (englishTipWord && englishTipMeaning) ? {
                word: englishTipWord,
                meaning: englishTipMeaning,
                example: englishTipExample
            } : undefined
        };

        setPosts([newPost, ...posts]);

        // Reset form
        setNewPostContent("");
        setNewPostImage("");
        setEnglishTipWord("");
        setEnglishTipMeaning("");
        setEnglishTipExample("");
        setShowCreateModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPostImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
                            src="https://i.pravatar.cc/150?img=12"
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
                {posts.map((post) => (
                    <article
                        key={post.id}
                        className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                        {/* Post Header */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={post.userAvatar}
                                        alt={post.userName}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/30"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                                    <p className="text-xs text-gray-500">{post.timestamp}</p>
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
                        {post.image && (
                            <div className="relative w-full aspect-[4/3] bg-gray-100">
                                <img
                                    src={post.image}
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
                                <p className="text-sm text-gray-600 italic">
                                    "{post.englishTip.example}"
                                </p>
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
                                            {post.likes}
                                        </span>
                                    </button>

                                    {/* Comment Button */}
                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center gap-2 group transition-all hover:scale-105"
                                    >
                                        <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-500">
                                            {post.comments.length}
                                        </span>
                                    </button>

                                    {/* Share Button */}
                                    <button className="flex items-center gap-2 group transition-all hover:scale-105">
                                        <Share2 className="w-6 h-6 text-gray-700 group-hover:text-green-500 transition-colors" />
                                    </button>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={() => handleSave(post.id)}
                                    className="transition-all hover:scale-110"
                                >
                                    <Bookmark
                                        className={`w-6 h-6 transition-all ${post.isSaved
                                            ? "fill-yellow-500 text-yellow-500"
                                            : "text-gray-700 hover:text-yellow-500"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {showComments[post.id] && (
                            <div className="border-t border-gray-100 bg-gray-50/50">
                                {/* Existing Comments */}
                                <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 animate-fadeIn">
                                            <img
                                                src={comment.userAvatar}
                                                alt={comment.userName}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm text-gray-900">
                                                        {comment.userName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {comment.timestamp}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comment Input */}
                                <div className="px-4 py-3 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://i.pravatar.cc/150?img=12"
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
                                            disabled={!commentInputs[post.id]?.trim()}
                                            className={`p-2 rounded-full transition-all ${commentInputs[post.id]?.trim()
                                                ? "bg-green-500 hover:bg-green-600 text-white hover:scale-110"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>
                ))}

                {/* Load More */}
                <div className="text-center py-8">
                    <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Tải thêm bài viết
                    </button>
                </div>
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
                                    src="https://i.pravatar.cc/150?img=12"
                                    alt="Your avatar"
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-green-400/30"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900">You</h3>
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
                                        onClick={() => setNewPostImage("")}
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
                                disabled={!newPostContent.trim()}
                                className={`px-8 py-2 rounded-full font-semibold transition-all ${newPostContent.trim()
                                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Đăng bài
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
