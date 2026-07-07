# 💬 Chat Distribuido en Tiempo Real

Un sistema de mensajería instantánea privado y global moderno, ligero y responsivo construido en Node.js utilizando **WebSockets** para la comunicación bidireccional en tiempo real y **SQLite** para la persistencia local de datos. El sistema está optimizado para soportar intercambio de archivos y notas de voz nativas.

---

## 🚀 Características Principales

* **⚡ Comunicación en Tiempo Real:** Implementación nativa con `Socket.io` para mensajería instantánea y actualizaciones de estado de usuarios (Online/Offline) al instante.
* **🎙️ Notas de Voz Nativas:** Grabación directa de audio desde el micrófono del usuario usando la API web `MediaRecorder` y reproducción integrada mediante reproductores de audio dinámicos dentro de la interfaz.
* **📎 Adjunto de Archivos:** Soporte para transferencia de documentos e imágenes pesadas mediante almacenamiento local y gestión con `Multer` (límite de hasta 40MB).
* **😀 Menú de Emojis Integrado:** Selector rápido de reacciones para dinamizar las conversaciones.
* **🔔 Sistema de Notificaciones Inteligente:** Contador dinámico de mensajes no leídos (*Badges*) integrado en la barra lateral para salas privadas y la sala global.
* **🗄️ Base de Datos Persistente:** Uso de `better-sqlite3` para un almacenamiento relacional veloz, eficiente y autónomo sin dependencias complejas de servidores externos.
* **🔐 Autenticación Segura:** Registro e inicio de sesión protegidos con encriptación de contraseñas mediante `bcryptjs`.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 (Variables nativas, layouts Flexbox y animaciones de pulsación) y JavaScript (Vanilla JS).
* **Backend:** Node.js, Express.js.
* **Tiempo Real:** Socket.io v4.
* **Base de Datos:** SQLite (`better-sqlite3`).
* **Gestión de Archivos:** Multer.
* **Seguridad:** Bcryptjs y Dotenv.

---

## 📂 Estructura del Proyecto

├── uploads/              # Carpeta persistente para archivos y notas de voz (.webm)
├── public/
│   └── index.html        # Interfaz de usuario (Chat de dos columnas, CSS y lógica JS)
├── db.js                 # Configuración de SQLite e inicialización automática de tablas
├── server.js             # Servidor Express, endpoints HTTP y eventos de WebSockets
├── package.json          # Dependencias y scripts del proyecto
└── .gitignore            # Exclusiones críticas para producción (node_modules, base de datos local)
💻 Instalación y Uso Local
Sigue estos pasos para correr el entorno de desarrollo en tu computadora:

Clonar el repositorio:

Bash
git clone https://github.com/tellezmartinezelidetvictoria-web/Convocatoria_Sistemas_Digitales.git
cd Convocatoria_Sistemas_Digitales
Instalar las dependencias:

Bash
npm install
Configurar las variables de entorno:
Crea un archivo .env en la raíz del proyecto (opcional para puerto local):

Plaintext
PORT=3000
Iniciar el servidor:

Bash
npm start
Acceder a la app:
Abre tu navegador e ingresa a http://localhost:3000.

☁️ Despliegue en Producción (Railway)
Este proyecto está completamente configurado y blindado para ser desplegado de forma gratuita en plataformas como Railway utilizando arquitectura de almacenamiento persistente:

El archivo db.js autocrea las tablas necesarias en la nube si la base de datos se encuentra vacía.

Guarda tanto la base de datos como los archivos adjuntos en la ruta estricta uploads/.

Importante en Railway: Se debe montar un Volume con el Mount Path /app/uploads y definir el Start Command como node server.js para asegurar la persistencia de datos y evitar el reinicio cíclico del contenedor.
