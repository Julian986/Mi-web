# Guía de Evaluación de Performance

## 📊 Dependencias Innecesarias Detectadas

### ✅ Dependencias que SÍ se están usando:
- `next` - Framework principal
- `react` / `react-dom` - Core de React
- `framer-motion` - Animaciones (ProjectsShowcase, ServicesDashboards)
- `lucide-react` - Iconos
- `tailwind-merge` - Utilidad para clases de Tailwind
- `clsx` - Utilidad para clases condicionales

### ❌ Dependencias que NO se están usando actualmente:

1. **`@radix-ui/react-slot`** - No encontrado en uso
   - **Tamaño**: ~5KB
   - **Acción**: Puede eliminarse si no se usa

2. **`class-variance-authority`** - No encontrado en uso
   - **Tamaño**: ~2KB
   - **Acción**: Puede eliminarse si no se usa

3. **`three`** - Solo se usa si Hero3D está activo (actualmente NO)
   - **Tamaño**: ~600KB (MUY PESADO)
   - **Acción**: Considerar eliminar si Hero3D no se va a usar

4. **`@react-three/fiber`** - Solo se usa si Hero3D está activo (actualmente NO)
   - **Tamaño**: ~150KB
   - **Acción**: Considerar eliminar si Hero3D no se va a usar

5. **`@react-three/drei`** - Solo se usa si Hero3D está activo (actualmente NO)
   - **Tamaño**: ~200KB
   - **Acción**: Considerar eliminar si Hero3D no se va a usar

**Ahorro potencial**: ~1MB si se eliminan todas las dependencias de Three.js

---

## 🔧 Herramientas de Evaluación de Performance

### 1. Bundle Analyzer (Instalado ✅)

```bash
npm run analyze
```

Esto abrirá un reporte visual en el navegador mostrando:
- Tamaño de cada dependencia
- Qué está contribuyendo más al bundle
- Dependencias duplicadas

### 2. Lighthouse (Chrome DevTools)

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Performance"
4. Click en "Generate report"

Métricas importantes:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### 3. React DevTools Profiler

1. Instala React DevTools (extensión del navegador)
2. Abre DevTools → Pestaña "Profiler"
3. Click en "Record"
4. Interactúa con la app (scroll, hover, etc.)
5. Detén la grabación
6. Analiza qué componentes se renderizan más

### 4. Performance API (en consola del navegador)

```javascript
// Medir tiempo de renderizado
performance.mark('start');
// ... tu código ...
performance.mark('end');
performance.measure('render', 'start', 'end');
console.log(performance.getEntriesByName('render')[0].duration);
```

### 5. Web Vitals (Next.js)

Next.js ya incluye Web Vitals. Puedes verlos en:
- Chrome DevTools → Network → "Web Vitals"
- O agregar manualmente en `_app.tsx` o `layout.tsx`

---

## 🚀 Optimizaciones Recomendadas

### Inmediatas:
1. **Eliminar dependencias no usadas** (especialmente Three.js si no se usa)
2. **Lazy load de imágenes** (ya estás usando `next/image` ✅)
3. **Code splitting** con `dynamic()` (ya lo haces con Hero3D ✅)

### Mediano plazo:
1. **Optimizar animaciones de Framer Motion**
   - Usar `layout` prop cuando sea posible
   - Evitar animar propiedades costosas (box-shadow, blur)
   - Usar `transform` y `opacity` en su lugar

2. **Imágenes optimizadas**
   - Convertir a WebP o AVIF
   - Usar tamaños apropiados (`sizes` prop)

3. **Font optimization**
   - Preload de fuentes críticas
   - Usar `font-display: swap`

### Avanzadas:
1. **Service Worker** para cache
2. **Prefetching** de rutas importantes
3. **Virtual scrolling** si hay muchas cards

---

## 📝 Comandos Útiles

```bash
# Analizar bundle size
npm run analyze

# Build de producción (más información)
npm run build

# Ver tamaño de dependencias instaladas
npm ls --depth=0

# Verificar dependencias no usadas (requiere herramienta externa)
npx depcheck
```

---

## 🔍 Cómo Identificar el Culpable

1. **Desactiva componentes uno por uno** (ya lo estás haciendo ✅)
2. **Usa React Profiler** para ver qué componente causa renders
3. **Revisa el Bundle Analyzer** para ver dependencias pesadas
4. **Prueba con Network throttling** en DevTools (Slow 3G)
5. **Revisa Performance tab** en DevTools durante el scroll

---

## ⚠️ Problemas Conocidos Actuales

1. **Three.js** (~1MB) instalado pero no usado → Eliminar
2. **Animaciones infinitas** pueden causar lag → Ya optimizado con pausa en scroll
3. **Box-shadow animado** causa reflows → Ya movido a estilo estático
4. **Blur effects** son costosos → Ya pausados durante scroll
