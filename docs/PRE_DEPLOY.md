# Pre-Deploy Checklist

Sebelum deploy production, ganti IDOR 403 -> 404 untuk hide existence.

## Ganti status code
Cari `TODO(PRE-DEPLOY)`:
- `apps/api/app/services/validation.py:45,68,91,114,137,160,183` (7 helpers)
- `apps/api/app/routes/documents.py:98,120,141,159,199` (5 checks)
- `apps/api/app/routes/users.py:81` (1 check)

Ubah:
```python
raise HTTPException(status_code=403, detail="... does not belong ...")
```
Menjadi:
```python
raise HTTPException(status_code=404, detail="Not found")
```

Update test:
- `apps/api/tests/test_iris.py:136` expect `403` -> `404`

## Verifikasi
```bash
grep -rn "PRE-DEPLOY" apps/api/app --include="*.py"
JWT_SECRET_KEY=test PYTHONPATH=apps/api apps/api/.venv/bin/pytest -q
alembic current
```
