import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, MoreHorizontal, 
  Loader2, User, Image as ImageIcon, X, 
  Share2, Globe, ThumbsUp, MessageCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  language: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  likes: { user_id: string }[];
  comments_count: number;
  is_liked: boolean;
  showComments?: boolean;
  comments?: Comment[];
}

const CommunityHub: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { user } = useAuth();
  const currentLanguage = i18n.language;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get user display name
  const getUserName = (postUser: any) => {
    if (!postUser) return t('community.anonymous');
    if (postUser.full_name && postUser.full_name.includes('@')) {
      return postUser.full_name.split('@')[0];
    }
    return postUser.full_name || t('community.anonymous');
  };

  useEffect(() => {
    fetchPosts();
  }, [user, currentLanguage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:profiles(full_name, avatar_url),
          likes:community_likes(user_id),
          comments:community_comments(count)
        `)
        .eq('language', currentLanguage)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data.map((post: any) => ({
        ...post,
        likes: post.likes || [],
        comments_count: post.comments?.[0]?.count || 0,
        is_liked: (post.likes || []).some((l: any) => l.user_id === user?.id),
        showComments: false,
        comments: []
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !selectedImage) || !user || isSubmitting) return;

    setIsSubmitting(true);
    let uploadedImageUrl = null;

    try {
      // Mocked image upload logic - in real world use supabase.storage
      if (selectedImage) {
        // Here you would upload to Supabase Storage:
        // const { data, error } = await supabase.storage.from('community').upload(`posts/${Date.now()}-${selectedImage.name}`, selectedImage);
        // if (data) uploadedImageUrl = supabase.storage.from('community').getPublicUrl(data.path).data.publicUrl;
        
        // For now using a placeholder or assuming upload works
        uploadedImageUrl = imagePreview; 
      }

      const { error } = await supabase
        .from('community_posts')
        .insert([{ 
          content: newPostContent, 
          user_id: user.id,
          language: currentLanguage,
          image_url: uploadedImageUrl
        }]);

      if (error) throw error;
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('community_likes')
          .insert([{ post_id: postId, user_id: user.id }]);
      }
      
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          const newIsLiked = !isLiked;
          return {
            ...p,
            is_liked: newIsLiked,
            likes: newIsLiked 
              ? [...p.likes, { user_id: user.id }]
              : p.likes.filter(l => l.user_id !== user.id)
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchPosts();
    }
  };

  const toggleComments = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.showComments) {
      try {
        const { data, error } = await supabase
          .from('community_comments')
          .select(`*, user:profiles(full_name, avatar_url)`)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, showComments: true, comments: data } : p
        ));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    } else {
      setPosts(prevPosts => prevPosts.map(p => 
        p.id === postId ? { ...p, showComments: false } : p
      ));
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert([{ post_id: postId, user_id: user.id, content }])
        .select(`*, user:profiles(full_name, avatar_url)`)
        .single();

      if (error) throw error;
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments_count: p.comments_count + 1,
            comments: p.comments ? [...p.comments, data] : [data]
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] overflow-y-auto font-sans">
      <div className="max-w-[680px] mx-auto w-full p-4 space-y-4">
        
        {/* Create Post Box - Facebook Style */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={24} />
                </div>
              )}
            </div>
            <button 
              onClick={() => setNewPostContent('')}
              className="flex-grow bg-[#F0F2F5] hover:bg-[#E4E6E9] rounded-full px-4 py-2 text-start text-gray-500 transition-colors"
            >
              {t('community.create_post_placeholder', { name: user?.user_metadata?.full_name?.split(' ')[0] || '' })}
            </button>
          </div>
          
          <div className="h-[1px] bg-gray-100 mb-2"></div>
          
          <div className="flex justify-around">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors text-gray-600 font-semibold"
            >
              <ImageIcon className="text-[#45BD62]" size={24} />
              <span>{t('common:community.upload_image')}</span>
            </button>
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          {/* New Post Modal/Expanded State (Simplified inline for now) */}
          {(newPostContent.length > 0 || imagePreview) && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full border-0 focus:ring-0 text-lg resize-none min-h-[100px]"
                placeholder={t('community.create_post_placeholder', { name: '' })}
              />
              
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={imagePreview} className="w-full h-auto max-h-[400px] object-cover" />
                  <button 
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <button 
                onClick={handleCreatePost}
                disabled={isSubmitting}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : t('community.post_button')}
              </button>
            </div>
          )}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-[#1877F2] animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-lg shadow-sm text-gray-400 border border-gray-200">
                {t('community.no_posts')}
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {post.user?.avatar_url ? (
                          <img src={post.user.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                        <div>
                          <h4 className="font-bold text-[#050505] hover:underline cursor-pointer">
                            {getUserName(post.user)}
                          </h4>
                          <div className="flex items-center gap-1 text-[12px] text-gray-500">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <Globe size={12} />
                          </div>
                        </div>
                    </div>
                    <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-[#050505] whitespace-pre-wrap text-[15px]">{post.content}</p>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="border-y border-gray-100 bg-black/5">
                      <img src={post.image_url} className="w-full h-auto max-h-[500px] object-contain mx-auto" alt="" />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="px-4 py-2 flex items-center justify-between text-[14px] text-gray-500">
                    <div className="flex items-center gap-1">
                      {post.likes.length > 0 && (
                        <>
                          <div className="bg-[#1877F2] p-1 rounded-full">
                            <ThumbsUp size={10} className="text-white" />
                          </div>
                          <span>{post.likes.length}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {post.comments_count > 0 && (
                        <button onClick={() => toggleComments(post.id)} className="hover:underline">
                          {post.comments_count} {t('common:community.comments')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="h-[1px] bg-gray-200"></div>
                  </div>

                  {/* Post Actions */}
                  <div className="px-1 py-1 flex">
                    <button 
                      onClick={() => handleToggleLike(post.id, post.is_liked)}
                      className={`flex-grow flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold ${post.is_liked ? 'text-[#1877F2]' : 'text-gray-600'}`}
                    >
                      <ThumbsUp size={20} className={post.is_liked ? 'fill-[#1877F2]' : ''} />
                      <span>{t('common:community.like')}</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex-grow flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 font-semibold"
                    >
                      <MessageCircle size={20} />
                      <span>{t('common:community.comment')}</span>
                    </button>
                    <button className="flex-grow flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 font-semibold">
                      <Share2 size={20} />
                      <span>{t('common:community.share')}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-4">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-1">
                            {comment.user?.avatar_url ? (
                              <img src={comment.user.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User size={18} />
                              </div>
                            )}
                          </div>
                          <div className="bg-[#F0F2F5] rounded-[18px] px-3 py-2 flex-grow max-w-[calc(100%-40px)]">
                            <div className="font-bold text-[13px] text-[#050505]">
                              {getUserName(comment.user)}
                            </div>
                            <p className="text-[14px] text-[#050505] break-words">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-2 pt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User size={18} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow bg-[#F0F2F5] rounded-full px-3 py-1.5 flex items-center">
                          <input 
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder={t('community.write_comment')}
                            className="w-full bg-transparent border-none focus:ring-0 text-[14px]"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="text-[#1877F2] p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Send size={16} className={i18n.language === 'en' ? 'rotate-180' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHub;
