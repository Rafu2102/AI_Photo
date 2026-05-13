-- 1. 自動建立 portfolio-images 儲存桶 (如果還沒建立的話)
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do update set public = true;

-- 2. 刪除可能存在的舊政策，避免重複執行報錯
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Anon Upload" on storage.objects;
drop policy if exists "Anon Update" on storage.objects;
drop policy if exists "Anon Delete" on storage.objects;

-- 3. 開放所有人都可以讀取儲存桶內的圖片
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'portfolio-images' );

-- 4. 開放前端 (anon) 可以上傳圖片
create policy "Anon Upload"
on storage.objects for insert
with check ( bucket_id = 'portfolio-images' );

-- 5. 開放前端 (anon) 可以修改圖片
create policy "Anon Update"
on storage.objects for update
using ( bucket_id = 'portfolio-images' );

-- 6. 開放前端 (anon) 可以刪除圖片
create policy "Anon Delete"
on storage.objects for delete
using ( bucket_id = 'portfolio-images' );
