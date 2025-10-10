# Guía de Configuración de Firebase Storage

## 📋 Pasos para Configurar el Bucket de Firebase Storage

### 🔍 **Paso 1: Verificar tu Proyecto Firebase**

1. Ve a la [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto actual
3. Anota el **Project ID** (lo necesitarás para las variables de entorno)

### 🗂️ **Paso 2: Configurar Firebase Storage**

#### **Opción A: Si ya tienes Storage configurado**
1. En el menú izquierdo, ve a **Storage** 
2. Anota el nombre exacto del bucket (usualmente es `tu-project-id.appspot.com`)
3. Verifica que el bucket esté activo

#### **Opción B: Si no tienes Storage configurado**
1. En el menú izquierdo, ve a **Build > Storage**
2. Haz clic en **"Get started"**
3. Sigue el asistente de configuración:
   - **Región**: Elige la más cercana a tus usuarios (ej: `us-central1`)
   - **Security rules**: Elige **"Start in test mode"** por ahora
   - **Location**: Deja la ubicación por defecto

### 🔐 **Paso 3: Configurar Reglas de Seguridad**

1. Ve a **Storage > Rules**
2. Reemplaza las reglas existentes con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de imágenes
    match /raffles/{raffleId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permitir lectura pública de imágenes generadas
    match /generated-raffles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Denegar todo lo demás por defecto
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
3. Haz clic en **"Publish"**

### 🔑 **Paso 4: Obtener Credenciales de Admin SDK**

1. Ve a **Project Settings** (⚙️ icono)
2. Pestaña **Service accounts**
3. Haz clic en **"Generate new private key"**
4. Guarda el archivo JSON (no lo compartas)
5. Del archivo JSON, necesitarás:
   - `project_id`
   - `client_email`
   - `private_key`

### 🌍 **Paso 5: Configurar Variables de Entorno**

Crea o actualiza tu archivo `.env.local`:

```env
# Variables de Firebase existentes
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id

# Variables de Firebase Admin SDK
FIREBASE_ADMIN_CLIENT_EMAIL=tu-client-email@tu-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu-private-key-aqui\n-----END PRIVATE KEY-----\n"

# Variable específica de Storage (opcional pero recomendado)
FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
```

### 🧪 **Paso 6: Verificar Configuración**

1. **Reinicia tu servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Prueba la creación de una rifa con imágenes**:
   - Ve a `/raffle/create`
   - Sube 1-3 imágenes
   - Intenta crear la rifa

3. **Verifica los logs**:
   - Deberías ver: `[CREATE_RAFFLE_ACTION] Using bucket: tu-project-id.appspot.com`
   - Si hay éxito: `✅ File uploaded successfully to: https://...`

### 🔍 **Paso 7: Verificar en Firebase Console**

1. Ve a **Storage** en Firebase Console
2. Deberías ver una carpeta `raffles/`
3. Dentro, una carpeta con el ID de la rifa creada
4. Las imágenes subidas deberían estar ahí

### 🚨 **Solución de Problemas Comunes**

#### **Error: "Bucket name not specified"**
- ✅ Verifica que `NEXT_PUBLIC_FIREBASE_PROJECT_ID` esté configurada
- ✅ Verifica que `FIREBASE_STORAGE_BUCKET` esté configurada
- ✅ Reinicia el servidor después de cambiar variables de entorno

#### **Error: "Permission denied"**
- ✅ Verifica las reglas de Storage (Paso 3)
- ✅ Asegúrate de estar autenticado al subir imágenes

#### **Error: "Invalid bucket name"**
- ✅ El nombre del bucket debe ser exacto: `tu-project-id.appspot.com`
- ✅ Sin https:// ni gs:// al principio

#### **Error: "File not found"**
- ✅ Verifica que las reglas permitan lectura pública
- ✅ Espera unos minutos después de cambiar las reglas

### 📊 **Estructura de Carpetas Esperada**

```
tu-project-id.appspot.com/
├── raffles/
│   ├── raffle-id-123/
│   │   ├── 1699123456789-image1.jpg
│   │   ├── 1699123456790-image2.jpg
│   │   └── 1699123456791-image3.jpg
│   └── raffle-id-456/
│       └── ...
└── generated-raffles/
    └── (futuras imágenes generadas por IA)
```

### ✅ **Checklist Final**

- [ ] Proyecto Firebase creado y seleccionado
- [ ] Firebase Storage configurado
- [ ] Reglas de seguridad aplicadas
- [ ] Credenciales de Admin SDK obtenidas
- [ ] Variables de entorno configuradas
- [ ] Servidor reiniciado
- [ ] Prueba de subida de imágenes exitosa
- [ ] Verificación en Firebase Console

### 🎯 **Resultado Esperado**

Una vez completada la configuración:
- ✅ Los usuarios podrán subir imágenes al crear rifas
- ✅ Las imágenes se almacenarán en Firebase Storage
- ✅ Las imágenes serán públicas y accesibles via URL
- ✅ Las URLs se guardarán en Firestore
- ✅ El carrusel mostrará las imágenes correctamente

---

**🎊 ¡Una vez completados estos pasos, el error del bucket estará resuelto!** 🎊
