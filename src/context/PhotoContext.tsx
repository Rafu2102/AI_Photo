"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { DUMMY_PHOTOS as INITIAL_PHOTOS } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export interface Photo {
  id: string;
  url: string;
  title: string;
  location: string;
  exif: string;
  tags: string[];
  views?: number;
}

interface Settings {
  id?: string;
  coverPhoto: string;
  aboutImage: string;
  aboutTitle: string;
  aboutDescription: string;
}

interface PhotoContextType {
  photos: Photo[];
  settings: Settings;
  siteViews: number;
  addPhoto: (photo: Omit<Photo, "id">) => Promise<void>;
  updatePhoto: (id: string, updated: Partial<Photo>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  incrementPhotoViews: (id: string) => Promise<void>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  coverPhoto: "https://images.unsplash.com/photo-1506744626753-1fa44df14c81?q=100&w=2560&auto=format&fit=crop",
  aboutImage: "https://images.unsplash.com/photo-1542051812871-757500d5a228?q=100&w=1500&auto=format&fit=crop",
  aboutTitle: "捕捉不一樣的世界視角",
  aboutDescription: "作為一名專注於空拍攝影的創作者，我致力於將大地之美、城市的脈動以及自然的寧靜，透過高空的鏡頭呈現給每一位觀看者。\n\n每一張照片背後，都代表著對光影的無盡追求與對這個世界的熱愛。我相信，從不同的高度看世界，能賦予我們全新的感受與體悟。",
};

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [siteViews, setSiteViews] = useState<number>(0);

  const fetchData = async () => {
    try {
      // 獲取照片
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;
      if (photosData) {
        const mappedPhotos = photosData.map((p: any) => {
          const localViews = typeof window !== 'undefined' ? localStorage.getItem(`photo_views_${p.id}`) : null;
          return {
            ...p,
            views: p.views !== undefined && p.views !== null 
              ? p.views 
              : (localViews ? parseInt(localViews, 10) : 0)
          };
        });
        setPhotos(mappedPhotos);
      }

      // 獲取全站設定
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      if (settingsData) {
        setSettings({
          id: settingsData.id,
          coverPhoto: settingsData.cover_photo,
          aboutImage: settingsData.about_image,
          aboutTitle: settingsData.about_title,
          aboutDescription: settingsData.about_description,
        });
      }

      // 獲取全站流量數
      const { data: statsData, error: statsError } = await supabase
        .from("site_stats")
        .select("views")
        .eq("id", 1)
        .single();

      if (statsError) {
        // 資料庫表未就緒，使用 LocalStorage
        if (typeof window !== 'undefined') {
          const localViews = localStorage.getItem("site_views");
          if (localViews) {
            setSiteViews(parseInt(localViews, 10));
          } else {
            const initialMock = 0;
            setSiteViews(initialMock);
            localStorage.setItem("site_views", initialMock.toString());
          }
        }
      } else if (statsData) {
        setSiteViews(statsData.views);
      }
    } catch (error) {
      console.warn("無法連接 Supabase 或發生錯誤", error);
      // 完全斷網容錯，加載初始 Dummy Photos
      if (typeof window !== 'undefined') {
        const localViews = localStorage.getItem("site_views") || "0";
        setSiteViews(parseInt(localViews, 10));
      }
      setPhotos(INITIAL_PHOTOS.map(p => {
        const localViews = typeof window !== 'undefined' ? localStorage.getItem(`photo_views_${p.id}`) : null;
        return {
          ...p,
          views: localViews ? parseInt(localViews, 10) : 0
        };
      }));
    }
  };

  const incrementSiteViews = async () => {
    if (typeof window === 'undefined') return;
    try {
      const hasCounted = sessionStorage.getItem("site_counted");
      if (hasCounted) return;

      const { data: currentStats, error: fetchError } = await supabase
        .from("site_stats")
        .select("views")
        .eq("id", 1)
        .single();

      const newViews = ((currentStats?.views || siteViews || 0) as number) + 1;
      
      const { error: upsertError } = await supabase
        .from("site_stats")
        .upsert({ id: 1, views: newViews });

      if (upsertError) throw upsertError;

      setSiteViews(newViews);
      localStorage.setItem("site_views", newViews.toString());
      sessionStorage.setItem("site_counted", "true");
    } catch (e) {
      console.warn("全站流量寫入資料庫失敗，改用本機計數器容錯:", e);
      const localViews = localStorage.getItem("site_views") || "0";
      const newLocalViews = parseInt(localViews, 10) + 1;
      localStorage.setItem("site_views", newLocalViews.toString());
      setSiteViews(newLocalViews);
      sessionStorage.setItem("site_counted", "true");
    }
  };

  useEffect(() => {
    fetchData().then(() => {
      incrementSiteViews();
    });
  }, []);

  const addPhoto = async (photo: Omit<Photo, "id">) => {
    try {
      const { data, error } = await supabase.from("photos").insert([photo]).select();
      if (error) throw error;
      if (data) {
        setPhotos([data[0], ...photos]);
      }
    } catch (e) {
      console.error("上傳資料庫失敗:", e);
      // Fallback fallback optimistic UI
      setPhotos([{ ...photo, id: Date.now().toString() }, ...photos]);
    }
  };

  const updatePhoto = async (id: string, updated: Partial<Photo>) => {
    try {
      const { error } = await supabase.from("photos").update(updated).eq("id", id);
      if (error) throw error;
      setPhotos(photos.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    } catch (e) {
      console.error("更新資料庫失敗:", e);
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      // 若有圖片在 Storage，需要先刪除圖片
      const photoToDelete = photos.find(p => p.id === id);
      if (photoToDelete && photoToDelete.url.includes("supabase.co")) {
        // 擷取檔名部分
        const pathSegments = photoToDelete.url.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        await supabase.storage.from("portfolio-images").remove([fileName]);
      }

      const { error } = await supabase.from("photos").delete().eq("id", id);
      if (error) throw error;
      setPhotos(photos.filter((p) => p.id !== id));
    } catch (e) {
      console.error("刪除資料失敗:", e);
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      
      const payload = {
        cover_photo: updated.coverPhoto,
        about_image: updated.aboutImage,
        about_title: updated.aboutTitle,
        about_description: updated.aboutDescription
      };

      if (settings.id) {
        await supabase.from("settings").update(payload).eq("id", settings.id);
      } else {
        // 如果還沒有 id，可能是手動初始化
        await supabase.from("settings").insert([payload]);
      }
    } catch (e) {
      console.error("更新設定失敗:", e);
    }
  };

  const incrementPhotoViews = useCallback(async (id: string) => {
    if (typeof window === 'undefined') return;
    
    // 防止單次 session 內重複點開灌水（必須放在最頂端阻擋！）
    const photoCountedKey = `photo_counted_${id}`;
    if (sessionStorage.getItem(photoCountedKey)) return;

    // 1. 樂觀 UI 更新，確保前台立刻有反應
    setPhotos((prevPhotos) =>
      prevPhotos.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
    );

    try {
      // 2. 直接向 Supabase 查詢該相片最新的真實點閱數，避免依賴 photos React 狀態以打破依賴死循環
      const { data, error: fetchError } = await supabase
        .from("photos")
        .select("views")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const currentViews = data?.views || 0;
      const newViews = currentViews + 1;

      const { error: updateError } = await supabase
        .from("photos")
        .update({ views: newViews })
        .eq("id", id);

      if (updateError) throw updateError;
      
      localStorage.setItem(`photo_views_${id}`, newViews.toString());
      sessionStorage.setItem(photoCountedKey, "true");
    } catch (e) {
      console.warn("更新照片觀看數失敗，採用 LocalStorage 容錯:", e);
      const localPhotoViews = localStorage.getItem(`photo_views_${id}`) || "0";
      const newLocalPhotoViews = parseInt(localPhotoViews, 10) + 1;
      localStorage.setItem(`photo_views_${id}`, newLocalPhotoViews.toString());
      sessionStorage.setItem(photoCountedKey, "true");
    }
  }, []);

  return (
    <PhotoContext.Provider value={{ photos, settings, siteViews, addPhoto, updatePhoto, deletePhoto, updateSettings, incrementPhotoViews }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used within a PhotoProvider");
  }
  return context;
}
