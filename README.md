# IRIS / AERIS

IRIS adalah **Personal Operating System** untuk mengelola project, task, note,
event, dokumen, tag, dan vocabulary dalam satu workspace lokal. **AERIS**
(_Adaptive Response Intelligence System_) adalah lapisan intelligence yang
direncanakan untuk membantu pencarian konteks, perencanaan, dan pengambilan
keputusan di atas data IRIS.

Repository ini masih dalam pengembangan. Backend dan frontend sudah dapat
dijalankan sebagai vertical slice, sedangkan pipeline AI handwriting OCR
disediakan sebagai komponen terpisah dan opsional.

## Fitur Saat Ini

- Register, login, JWT authentication, dan profile pengguna.
- CRUD project, task, note, event, document metadata, tag, dan vocabulary.
- Task dependency dan ownership data per user.
- Dashboard dan workspace web responsif.
- PostgreSQL 17 dengan Alembic migration.
- Pipeline IAM handwriting untuk fine-tuning dan inference TrOCR.

Fitur full-text search, workflow AERIS, OCR sebagai background job, dan
dukungan layout halaman masih berada dalam tahap berikutnya. Detail product
requirements tersedia di [PRD.md](PRD.md), sedangkan keputusan arsitektur ada
di [aeris.md](aeris.md).

## Struktur Repository

```text
apps/
├── api/                 FastAPI, SQLAlchemy, Alembic, dan API tests
├── ai/handwriting/      Pipeline IAM dan TrOCR
└── web/                 Next.js, React, TypeScript, dan Tailwind
data/
└── documents/           Root dokumen lokal yang dipindai API
infrastructure/docker/  PostgreSQL dan Adminer
packages/shared/        Paket bersama untuk kebutuhan lintas aplikasi
```

## Prasyarat

- Git
- Python 3.13 atau versi yang kompatibel dengan dependency proyek
- Node.js 20 atau lebih baru dan npm
- Docker Engine dengan Docker Compose plugin
- RAM dan ruang disk tambahan jika menjalankan model TrOCR

## Clone dan Database

```bash
git clone <URL-REPOSITORY>
cd AERIS

docker compose -f infrastructure/docker/compose.yaml up -d
docker compose -f infrastructure/docker/compose.yaml ps
```

PostgreSQL tersedia di `localhost:5432` dengan nilai development berikut:

```text
database: iris
user: iris
password: iris_dev_password
```

Adminer tersedia di <http://localhost:8080>. Gunakan `postgres` sebagai server
ketika Adminer berjalan di dalam Compose; gunakan `localhost` dari host lokal.

## Menjalankan API

Buka terminal baru:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Buat `apps/api/.env`:

```dotenv
JWT_SECRET_KEY=ganti-dengan-secret-random-untuk-development
DATABASE_URL=postgresql+psycopg://iris:iris_dev_password@localhost:5432/iris
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
DOCUMENTS_ROOT=../../data/documents
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Jangan commit file `.env` atau gunakan secret development untuk deployment.

Jalankan migration dan server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API tersedia di <http://localhost:8000>. Dokumentasi interaktif ada di
<http://localhost:8000/docs>. Pemeriksaan cepat:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/health/db
```

## Menjalankan Web

```bash
cd apps/web
npm install
```

Opsional, buat `apps/web/.env.local` jika API tidak berjalan di port default:

```dotenv
API_SERVER_URL=http://localhost:8000
```

Jalankan frontend:

```bash
npm run dev
```

Buka <http://localhost:3000>. Perintah lain:

```bash
npm run lint
npm run build
npm run start
```

Frontend meneruskan request `/api/*` ke API melalui `API_SERVER_URL`.

## Menjalankan AI Handwriting OCR

Pipeline AI tidak diperlukan untuk menjalankan API atau web. Untuk
menjalankannya:

```bash
cd apps/ai
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r handwriting/requirements.txt
```

Buat manifest IAM terlebih dahulu:

```bash
python handwriting/prepare_iam.py <folder-dataset-iam> \
	--output data/iam_manifest.csv
```

Uji training dengan 100 sample:

```bash
python handwriting/train_trocr.py data/iam_manifest.csv \
	--output artifacts/trocr-iam \
	--epochs 1 \
	--batch-size 1 \
	--limit 100
```

Opsi `--limit` mengambil data train dan validation secara proporsional agar
training kecil tetap memiliki validation set. Model TrOCR berukuran besar dan
training CPU dapat memerlukan waktu lama. `HF_TOKEN` bersifat opsional, tetapi
dapat membantu rate limit Hugging Face.

Inference ke Markdown:

```bash
python handwriting/infer_markdown.py artifacts/trocr-iam data/scan.png \
	--output ../../data/documents/scan.md
```

Dataset IAM terutama berisi kata berbahasa Inggris. Pipeline ini belum
ditujukan untuk layout halaman, tabel, atau tulisan bahasa Indonesia.

## Pengujian dan Troubleshooting

API dapat diperiksa dengan:

```bash
cd apps/api
source .venv/bin/activate
pytest
python -m pip check
```

Jika muncul error tokenizer TrOCR seperti `Couldn't instantiate the backend
tokenizer`, pastikan command dijalankan memakai `apps/ai/.venv/bin/python` dan
requirements AI sudah di-install ulang. Versi pentingnya adalah:
`transformers==4.45.2`, `tokenizers==0.20.3`, dan `sentencepiece==0.2.2`.

Jika validation kosong saat memakai `--limit`, gunakan versi skrip terbaru.
Pipeline sekarang menyertakan baris validation secara otomatis.

## Kontribusi

1. Buat branch dari `main`.
2. Jaga perubahan tetap fokus pada satu fitur atau perbaikan.
3. Jalankan `pytest`, `npm run lint`, dan pemeriksaan yang relevan.
4. Jelaskan perubahan, cara menguji, dan konfigurasi yang diperlukan pada pull
   request.

## Lisensi dan Data

Repository ini dapat berisi konfigurasi lokal dan data workspace pribadi.
Jangan mengunggah credential, token, database dump, atau dokumen pribadi.
Periksa lisensi dataset dan model sebelum membagikan hasil turunannya.
