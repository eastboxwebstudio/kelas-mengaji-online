
-- Masukkan data kelas contoh
-- Nota: instructor_id dibiarkan NULL buat masa ini kerana kita tiada ID pengguna sebenar anda.
-- Anda boleh kemaskini kemudian melalui Admin Dashboard jika perlu.

INSERT INTO public.classes (title, description, price, google_meet_link, is_active, type, sessions, instructor_name)
VALUES 
('Kelas Asas Al-Quran (Iqra 1-6)', 'Sesuai untuk pemula yang ingin mengenal huruf, makhraj, dan asas bacaan dengan betul.', 50.00, 'https://meet.google.com/abc-defg-hij', true, 'monthly', '["2024-03-01T20:00:00Z", "2024-03-08T20:00:00Z", "2024-03-15T20:00:00Z", "2024-03-22T20:00:00Z"]'::jsonb, 'Ustaz Adam'),

('Talaqqi Bersanad Juz Amma', 'Kelas lanjutan untuk memperbaiki bacaan surah-surah lazim dengan bimbingan guru bertauliah.', 80.00, 'https://meet.google.com/xyz-123-456', true, 'monthly', '["2024-03-02T20:00:00Z", "2024-03-09T20:00:00Z", "2024-03-16T20:00:00Z", "2024-03-23T20:00:00Z"]'::jsonb, 'Ustazah Aminah'),

('Bengkel Fardu Ain & Solat', 'Belajar cara solat, wuduk, dan asas fardu ain yang betul mengikut mazhab Syafiie dalam satu sesi intensif.', 30.00, 'https://meet.google.com/solat-link', true, 'single', '["2024-03-10T09:00:00Z"]'::jsonb, 'Ustaz Rizuan');
