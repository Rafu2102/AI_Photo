-- 1. 建立照片資料表 (photos)
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    exif TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. 建立系統設定資料表 (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cover_photo TEXT NOT NULL,
    about_image TEXT NOT NULL,
    about_title TEXT NOT NULL,
    about_description TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 3. 確保前端 (anon 匿名角色) 具有這些資料表的基本操作權限
GRANT ALL ON public.photos TO anon;
GRANT ALL ON public.photos TO authenticated;
GRANT ALL ON public.settings TO anon;
GRANT ALL ON public.settings TO authenticated;

-- 4. 寫入預設設定資料 (如果尚無資料才寫入)
INSERT INTO public.settings (cover_photo, about_image, about_title, about_description)
SELECT 
    'https://images.unsplash.com/photo-1506744626753-1fa44df14c81?q=100&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542051812871-757500d5a228?q=100&w=1500&auto=format&fit=crop',
    '捕捉不一樣的世界視角',
    '作為一名專注於空拍攝影的創作者，我致力於將大地之美、城市的脈動以及自然的寧靜，透過高空的鏡頭呈現給每一位觀看者。'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- 5. 設定 Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 刪除可能已存在的舊 Policy 避免重複建立報錯
DROP POLICY IF EXISTS "Allow public read access on photos" ON public.photos;
DROP POLICY IF EXISTS "Allow anonymous insert on photos" ON public.photos;
DROP POLICY IF EXISTS "Allow anonymous update on photos" ON public.photos;
DROP POLICY IF EXISTS "Allow anonymous delete on photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow anonymous update on settings" ON public.settings;

-- 建立新的 Policy 開放所有操作 (作為個人作品集使用)
CREATE POLICY "Allow public read access on photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on photos" ON public.photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on photos" ON public.photos FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on photos" ON public.photos FOR DELETE USING (true);

CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update on settings" ON public.settings FOR UPDATE USING (true);
