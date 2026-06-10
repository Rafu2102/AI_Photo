"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogOut, Upload, Image as ImageIcon, Settings, Trash2, Edit3, Check, Loader2, X, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { usePhotos, Photo } from "@/context/PhotoContext";
import { supabase } from "@/lib/supabase";

const PREDEFINED_TAGS = ["自然", "城市", "夜景", "電影感", "底片風"];

export default function AdminPage() {
  const { photos, settings, addPhoto, updatePhoto, deletePhoto, updateSettings } = usePhotos();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("manage");
  const [errorMsg, setErrorMsg] = useState("");

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadExif, setUploadExif] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editExif, setEditExif] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Settings State
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(settings.coverPhoto);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [aboutImage, setAboutImage] = useState(settings.aboutImage);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutTitle, setAboutTitle] = useState(settings.aboutTitle);
  const [aboutDescription, setAboutDescription] = useState(settings.aboutDescription);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setCoverPhotoUrl(settings.coverPhoto);
    setAboutImage(settings.aboutImage);
    setAboutTitle(settings.aboutTitle);
    setAboutDescription(settings.aboutDescription);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("帳號或密碼錯誤");
    }
  };

  const uploadToSupabase = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const toggleTag = (tag: string, currentTags: string[], setTags: (tags: string[]) => void) => {
    if (currentTags.includes(tag)) {
      setTags(currentTags.filter(t => t !== tag));
    } else {
      setTags([...currentTags, tag]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return alert("請選擇實體檔案並填寫標題！");

    setIsUploading(true);
    setSuccessMsg("");

    try {
      const publicUrl = await uploadToSupabase(uploadFile);
      await addPhoto({
        url: publicUrl,
        title: uploadTitle,
        location: uploadLocation || "未知地點",
        exif: uploadExif || "未提供 EXIF",
        tags: uploadTags,
      });

      setSuccessMsg("作品已成功發布至前台！");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadTitle(""); setUploadLocation(""); setUploadTags([]); setUploadExif("");

      setTimeout(() => { setSuccessMsg(""); setActiveTab("manage"); }, 2000);
    } catch (err: any) {
      alert(`上傳失敗: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditLocation(photo.location);
    setEditExif(photo.exif);
    setEditTags(photo.tags);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    setIsEditing(true);

    try {
      await updatePhoto(editingPhoto.id, {
        title: editTitle,
        location: editLocation,
        exif: editExif,
        tags: editTags
      });
      setEditingPhoto(null);
    } catch (err: any) {
      alert(`更新失敗: ${err.message}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要將這張照片從雲端硬碟中永久刪除嗎？此動作無法復原！")) {
      await deletePhoto(id);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      let finalCoverUrl = coverPhotoUrl;
      let finalAboutUrl = aboutImage;

      const extractFileName = (url: string) => {
        if (!url.includes("supabase.co")) return null;
        const parts = url.split('/');
        return parts[parts.length - 1];
      };

      if (coverPhotoFile) {
        finalCoverUrl = await uploadToSupabase(coverPhotoFile);
        
        const oldFileName = extractFileName(coverPhotoUrl);
        if (oldFileName) {
          await supabase.storage.from('portfolio-images').remove([oldFileName]);
        }
        
        setCoverPhotoUrl(finalCoverUrl);
        setCoverPhotoFile(null);
      }

      if (aboutImageFile) {
        finalAboutUrl = await uploadToSupabase(aboutImageFile);
        
        const oldFileName = extractFileName(aboutImage);
        if (oldFileName) {
          await supabase.storage.from('portfolio-images').remove([oldFileName]);
        }

        setAboutImage(finalAboutUrl);
        setAboutImageFile(null);
      }

      await updateSettings({ 
        coverPhoto: finalCoverUrl,
        aboutImage: finalAboutUrl,
        aboutTitle,
        aboutDescription
      });
      setSettingsSuccessMsg("系統設定與圖片已成功更新至雲端！");
      setTimeout(() => setSettingsSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(`更新設定失敗: ${err.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-10 glass-card rounded-2xl border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <Lock className="w-8 h-8 text-white mb-4" />
            <h1 className="text-2xl font-medium tracking-widest uppercase text-white">Horizon 管理後台</h1>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-white/30 outline-none" placeholder="管理員帳號" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-white/30 outline-none" placeholder="密碼" required />
            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}
            <button className="w-full bg-white text-black font-medium tracking-wider uppercase text-sm py-4 rounded-lg hover:bg-neutral-200 transition-colors">登入系統</button>
          </form>
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> 返回前台網站
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-950">
      <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col hidden md:flex">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <span className="font-semibold tracking-widest text-white text-xl">Horizon</span>
        </div>
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          <button onClick={() => { setActiveTab("manage"); setEditingPhoto(null); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all ${activeTab === "manage" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}><ImageIcon className="w-4 h-4"/> 攝影作品庫</button>
          <button onClick={() => { setActiveTab("upload"); setEditingPhoto(null); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all ${activeTab === "upload" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}><Upload className="w-4 h-4"/> 發布新作品</button>
          <button onClick={() => { setActiveTab("settings"); setEditingPhoto(null); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all ${activeTab === "settings" ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}><Settings className="w-4 h-4"/> 系統全域設定</button>
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
            <Home className="w-4 h-4" /> 返回前台
          </Link>
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-4 h-4" /> 登出系統
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 right-0 p-8 md:hidden">
           <Link href="/" className="text-neutral-500 hover:text-white mr-4"><Home className="w-5 h-5 inline" /></Link>
           <button onClick={() => setIsAuthenticated(false)} className="text-neutral-500 hover:text-red-400"><LogOut className="w-5 h-5 inline" /></button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "manage" && !editingPhoto && (
            <motion.div key="manage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-light text-white mb-2">攝影作品庫</h2>
                  <p className="text-neutral-500 text-sm">管理與編輯您發布的所有空拍作品</p>
                </div>
                <button onClick={() => setActiveTab("upload")} className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10">
                  + 發布新作品
                </button>
              </div>
              
              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-neutral-500 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p>雲端資料庫目前沒有任何照片，立即發布您的第一張作品吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {photos.map(photo => (
                    <div key={photo.id} className="group bg-neutral-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 flex flex-col hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-white/5">
                      <div className="h-56 bg-black flex items-center justify-center relative overflow-hidden">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-medium text-lg truncate pr-4">{photo.title}</h3>
                        </div>
                        <p className="text-neutral-500 text-sm mb-4 truncate">{photo.location}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {photo.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-neutral-400 rounded-md border border-white/5">{tag}</span>
                          ))}
                        </div>

                        <div className="mt-auto flex gap-3">
                          <button onClick={() => handleEditClick(photo)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-white/10">
                            <Edit3 className="w-4 h-4" /> 編輯
                          </button>
                          <button onClick={() => handleDelete(photo.id)} className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-xl transition-colors flex items-center justify-center border border-transparent hover:border-red-500/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "manage" && editingPhoto && (
            <motion.div key="edit" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <button onClick={() => setEditingPhoto(null)} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4 text-sm">
                    <ArrowLeft className="w-4 h-4" /> 返回作品庫
                  </button>
                  <h2 className="text-3xl font-light text-white">編輯作品資訊</h2>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
                <div className="mb-8 rounded-2xl overflow-hidden h-72 bg-black flex justify-center border border-white/5 relative">
                  <img src={editingPhoto.url} className="h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <span className="text-white font-medium drop-shadow-md">{editTitle || "無標題"}</span>
                  </div>
                </div>
                <form onSubmit={handleSaveEdit} className="space-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">作品標題</label>
                    <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">拍攝地點</label>
                      <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">EXIF 參數資訊</label>
                      <input type="text" value={editExif} onChange={(e) => setEditExif(e.target.value)} placeholder="例如: ISO 100 • 1/200s • f/2.8" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">分類標籤 (可複選)</label>
                    <div className="flex flex-wrap gap-3">
                      {PREDEFINED_TAGS.map(tag => (
                        <button 
                          key={tag} 
                          type="button" 
                          onClick={() => toggleTag(tag, editTags, setEditTags)}
                          className={`px-4 py-2 rounded-lg text-sm border transition-all ${editTags.includes(tag) ? "bg-white text-black border-white font-medium shadow-lg shadow-white/20" : "bg-black/50 border-white/10 text-neutral-400 hover:border-white/30"}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                    <button type="button" onClick={() => setEditingPhoto(null)} className="px-6 py-3 text-neutral-400 hover:text-white transition-colors text-sm">取消</button>
                    <button type="submit" disabled={isEditing} className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-neutral-200 flex items-center gap-2 shadow-lg shadow-white/10">
                      {isEditing ? <Loader2 className="w-4 h-4 animate-spin"/> : "儲存變更"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-light text-white mb-2">發布新作品</h2>
                <p className="text-neutral-500 text-sm">上傳高畫質圖片並填寫作品資訊，即時同步至前台</p>
              </div>
              
              {successMsg && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-3"><Check className="w-5 h-5"/> {successMsg}</motion.div>}
              
              <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
                <form onSubmit={handleUpload} className="space-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">1. 選擇實體照片檔 (.jpg, .png)</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" required ref={fileInputRef} onChange={e => setUploadFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors ${uploadFile ? "border-white/30 bg-white/5" : "border-white/10 bg-black/50 group-hover:border-white/30 group-hover:bg-white/5"}`}>
                        <Upload className={`w-8 h-8 mb-4 ${uploadFile ? "text-white" : "text-neutral-500"}`} />
                        <span className={`text-sm font-medium ${uploadFile ? "text-white" : "text-neutral-400"}`}>
                          {uploadFile ? uploadFile.name : "點擊或拖曳圖片至此區塊上傳"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">2. 作品標題</label>
                    <input type="text" required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" placeholder="為這張作品取個好名字" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">3. 拍攝地點</label>
                      <input type="text" value={uploadLocation} onChange={(e) => setUploadLocation(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" placeholder="例如：台北市信義區" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">4. EXIF 參數資訊</label>
                      <input type="text" value={uploadExif} onChange={(e) => setUploadExif(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors" placeholder="例如：DJI Mini 3 Pro • ISO 100" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">5. 分類標籤 (可複選)</label>
                    <div className="flex flex-wrap gap-3">
                      {PREDEFINED_TAGS.map(tag => (
                        <button 
                          key={tag} 
                          type="button" 
                          onClick={() => toggleTag(tag, uploadTags, setUploadTags)}
                          className={`px-4 py-2 rounded-lg text-sm border transition-all ${uploadTags.includes(tag) ? "bg-white text-black border-white font-medium shadow-lg shadow-white/20" : "bg-black/50 border-white/10 text-neutral-400 hover:border-white/30"}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex justify-end">
                    <button type="submit" disabled={isUploading} className="bg-white text-black px-10 py-4 rounded-xl font-medium tracking-wide hover:bg-neutral-200 flex items-center gap-3 shadow-lg shadow-white/10 transition-all hover:-translate-y-1">
                      {isUploading ? <><Loader2 className="w-5 h-5 animate-spin"/> 發布中...</> : "確認上傳並發布"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-light text-white mb-2">系統全域設定</h2>
                <p className="text-neutral-500 text-sm">管理首頁動態視覺與個人簡介資訊</p>
              </div>

              {settingsSuccessMsg && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-3"><Check className="w-5 h-5"/> {settingsSuccessMsg}</motion.div>}
              
              <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
                <form onSubmit={handleSaveSettings} className="space-y-10">
                  
                  {/* Hero Cover Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/10 rounded-lg"><ImageIcon className="w-5 h-5 text-white" /></div>
                      <h3 className="text-xl font-medium text-white">首頁滿版封面設定</h3>
                    </div>
                    <div className="space-y-6 bg-black/30 p-6 rounded-2xl border border-white/5">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">上傳新封面檔案 (將覆蓋現有圖片)</label>
                        <input type="file" accept="image/*" onChange={e => setCoverPhotoFile(e.target.files?.[0] || null)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-5 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-neutral-200 transition-colors file:cursor-pointer" />
                      </div>
                      {coverPhotoUrl && !coverPhotoFile && (
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">當前使用的封面預覽</label>
                          <div className="h-56 overflow-hidden rounded-xl border border-white/10 bg-black relative group">
                            <img src={coverPhotoUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <hr className="border-white/10" />

                  {/* About Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/10 rounded-lg"><Settings className="w-5 h-5 text-white" /></div>
                      <h3 className="text-xl font-medium text-white">關於我區塊設定</h3>
                    </div>
                    <div className="space-y-8 bg-black/30 p-6 rounded-2xl border border-white/5">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/3">
                          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">個人形象照</label>
                          {aboutImage && !aboutImageFile && (
                            <div className="aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-black mb-4"><img src={aboutImage} className="w-full h-full object-cover" /></div>
                          )}
                          <input type="file" accept="image/*" onChange={e => setAboutImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-neutral-400 file:block file:w-full file:mb-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors file:cursor-pointer" />
                        </div>
                        <div className="w-full md:w-2/3 space-y-6">
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">專區主標題 (支援換行)</label>
                            <textarea required value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors min-h-[100px] resize-y" />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">理念介紹內文</label>
                            <textarea required value={aboutDescription} onChange={e => setAboutDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/30 outline-none transition-colors min-h-[220px] resize-y" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="pt-8 border-t border-white/5 flex justify-end">
                    <button type="submit" disabled={isSavingSettings} className="bg-white text-black px-10 py-4 rounded-xl font-medium tracking-wide hover:bg-neutral-200 flex items-center gap-3 shadow-lg shadow-white/10 transition-all hover:-translate-y-1">
                      {isSavingSettings ? <><Loader2 className="w-5 h-5 animate-spin"/> 儲存中...</> : "儲存設定並同步至雲端"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
