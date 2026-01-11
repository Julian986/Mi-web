# 🚀 Configuración de Vercel para Deploy

## ✅ Estructura Simplificada

El proyecto Next.js ahora está en la **raíz del repositorio**, por lo que Vercel lo detectará automáticamente sin configuración adicional.

## 🎯 Pasos para Deploy

1. **Hacer push de cambios**
   ```bash
   git add .
   git commit -m "Simplificar estructura: mover proyecto a raíz"
   git push
   ```

2. **Vercel detectará automáticamente Next.js**
   - No necesitas configurar Root Directory
   - Vercel detectará `package.json` con Next.js
   - El build se ejecutará automáticamente

3. **¡Listo!** El deploy debería funcionar sin problemas

## 📝 Configuración Actual

**package.json (raíz):**
```json
{
  "scripts": {
    "build": "next build --turbopack",
    "dev": "next dev --turbopack",
    "start": "next start"
  },
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  }
}
```

## ✅ Verificación

Después del deploy exitoso:
- ✅ Build debe completarse sin errores
- ✅ Next.js detectado automáticamente
- ✅ El sitio debe estar online

## 📝 Nota

Si anteriormente configuraste **Root Directory** a `mi-web` en Vercel:
1. Ve a Settings → General → Root Directory
2. Elimina el Root Directory o cámbialo a `/` (raíz)
3. Guarda y haz un nuevo deploy
