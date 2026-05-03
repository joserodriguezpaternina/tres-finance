# Tres Studio · Finanzas v2
Dashboard financiero oscuro con Supabase para acceso multiusuario.

---

## 🚀 Setup en 10 minutos

### 1. Crear base de datos en Supabase (GRATIS)

1. Ve a **[supabase.com](https://supabase.com)** → New project
2. Nombre: `tres-studio-finance` · Región: South America (São Paulo)
3. Guarda la contraseña y espera ~2 minutos
4. Ve a **SQL Editor** y pega y ejecuta este SQL:

```sql
create table if not exists incomes (
  id text primary key,
  client text, project text, date date,
  amount numeric, has_iva boolean default false,
  iva_p numeric default 19, status text,
  method text, notes text,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id text primary key,
  date date, cat text, sub text,
  description text, provider text,
  amount numeric, has_iva boolean default false,
  iva_p numeric default 19, method text, obs text,
  created_at timestamptz default now()
);

create table if not exists recurring (
  id text primary key,
  name text, cat text, amount numeric,
  has_iva boolean default false, iva_p numeric default 19,
  freq text, day_of_month integer,
  method text, active boolean default true,
  icon_name text, notes text,
  created_at timestamptz default now()
);

alter table incomes   enable row level security;
alter table expenses  enable row level security;
alter table recurring enable row level security;

create policy "allow all" on incomes   for all using (true) with check (true);
create policy "allow all" on expenses  for all using (true) with check (true);
create policy "allow all" on recurring for all using (true) with check (true);
```

5. Ve a **Settings → API** y copia:
   - **Project URL** → `https://XXXX.supabase.co`
   - **anon public key** → `eyJXXXX...`

---

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:
```
VITE_SUPABASE_URL=https://TUPROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyTUCLAVE...
```

> ⚠️ **Nunca subas el .env a GitHub.** Ya está en .gitignore.

---

### 3. Subir a Netlify con variables de entorno

En Netlify → Site settings → **Environment variables**, agrega:
- `VITE_SUPABASE_URL` = tu URL de Supabase
- `VITE_SUPABASE_ANON_KEY` = tu clave pública

Luego haz deploy. ¡Listo! Todos los dispositivos compartirán los mismos datos.

---

## 💻 Desarrollo local

```bash
npm install
# Crea el .env con tus credenciales de Supabase
npm run dev
```

---

## 📱 Acceso multiusuario

Con Supabase conectado:
- ✅ Datos compartidos en tiempo real
- ✅ Accesible desde cualquier dispositivo
- ✅ Celular, tablet, computador
- ✅ Múltiples personas pueden ingresar datos
- ✅ Sin instalar nada

Sin Supabase (modo local):
- ⚠️ Solo disponible en el navegador donde se ingresó
- ⚠️ No se comparte entre dispositivos
