# 🔧 Solución para Errores de Next.js con OneDrive

## ⚠️ Problema

Los errores `ENOENT` con archivos temporales de Next.js suelen ocurrir cuando:
- OneDrive está sincronizando la carpeta `.next` (aunque esté en `.gitignore`)
- El servidor se reinicia mientras compila
- Hay múltiples procesos de Node.js corriendo

## ✅ Soluciones

### Opción 1: Excluir `.next` de OneDrive (RECOMENDADO)

1. Click derecho en la carpeta `mi-web`
2. Selecciona "Liberar espacio" o "Siempre mantener en este dispositivo"
3. O mejor: Excluir la carpeta `.next` específicamente

**Pasos detallados:**
1. Abre OneDrive → Configuración
2. Ve a "Copia de seguridad" → "Administrar copia de seguridad"
3. O usa: Click derecho en `mi-web` → "Liberar espacio"

### Opción 2: Mover el proyecto fuera de OneDrive

Mover el proyecto a una carpeta fuera de OneDrive:
```
C:\Dev\mi-web
C:\Projects\mi-web
```

### Opción 3: Reiniciar el servidor limpiamente

```bash
# 1. Detener el servidor (Ctrl+C)
# 2. Eliminar .next
rm -rf .next
# En PowerShell:
Remove-Item -Recurse -Force .next

# 3. Reiniciar
npm run dev
```

## 🚀 Solución Rápida (Script)

Crea un script `dev:clean` en `package.json`:

```json
{
  "scripts": {
    "dev:clean": "rm -rf .next && npm run dev"
  }
}
```

En PowerShell:
```json
{
  "scripts": {
    "dev:clean": "if (Test-Path .next) { Remove-Item -Recurse -Force .next }; npm run dev"
  }
}
```

## 📝 Nota

Estos errores **NO afectan la funcionalidad** de la app, solo son molestos. Son warnings de desarrollo que se resuelven solos al reiniciar el servidor correctamente.

## ⚡ Comando Rápido

Si solo quieres reiniciar limpio:
```bash
# PowerShell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; npm run dev
```
