🔐 SecureBase — Full-Stack Authentication & RBAC Starter

Sistema completo de autenticación, autorización basada en roles (RBAC) y gestión segura de sesiones, desarrollado con Spring Boot 4, Java 17, React 19 y Vite 8.

SecureBase implementa un ciclo de autenticación completo con Access Tokens y Refresh Tokens, rotación automática de tokens, protección CSRF para aplicaciones SPA, verificación de cuentas por correo electrónico, recuperación de contraseñas y control de acceso basado en roles.

El objetivo del proyecto es ofrecer una base de autenticación reutilizable, con especial atención a la seguridad, la consistencia de datos y la gestión del ciclo de vida de las sesiones.

✨ Características principales
🔑 Autenticación Dual-Token (Access + Refresh)
Access Token (JWT): token de corta duración almacenado exclusivamente en memoria en el cliente, reduciendo su exposición ante ataques XSS.
Refresh Token: almacenado en una cookie HttpOnly, inaccesible desde JavaScript.
Rotación automática: cada renovación genera un nuevo Refresh Token e invalida el anterior.
Persistencia hasheada: los Refresh Tokens se almacenan en MySQL utilizando SHA-256.
Revocación de sesiones: las sesiones activas se revocan automáticamente después de un restablecimiento de contraseña.
🛡️ Seguridad
Spring Security con autenticación stateless.
Protección CSRF para aplicaciones SPA mediante csrf.spa().
Cookie XSRF-TOKEN y cabecera X-XSRF-TOKEN.
Encriptación de contraseñas mediante BCrypt.
Manejadores personalizados de autenticación y acceso denegado.
Configuración CORS.
Validación de datos mediante Bean Validation.
📧 Ciclo de vida de cuenta
Registro de usuarios.
Verificación de correo electrónico mediante códigos OTP de 6 dígitos.
Expiración de códigos OTP después de 15 minutos.
Límite de intentos de verificación.
Cooldown de 60 segundos para reenvío de códigos.
Recuperación de contraseñas.
Restablecimiento seguro de contraseñas.
Revocación de sesiones activas después del restablecimiento.
⚙️ Concurrencia y consistencia
Bloqueos pesimistas mediante PESSIMISTIC_WRITE en JPA.
Prevención de condiciones de carrera durante la rotación de Refresh Tokens.
Control de concurrencia durante la validación de códigos de verificación.
👥 Control de acceso basado en roles (RBAC)
ROLE_USER
ROLE_ADMIN
Inicialización automática de roles al iniciar la aplicación.
Protección de endpoints según los permisos del usuario autenticado.
🛠️ Stack tecnológico
Backend
Tecnología	Utilización
Java 17	Lenguaje de programación
Spring Boot 4.1.1	Framework backend
Spring Security	Autenticación y autorización
Spring Data JPA	Persistencia de datos
MySQL 8+	Base de datos relacional
JJWT 0.12.6	Generación y validación de JWT
Jakarta Mail	Envío de correos electrónicos
BCrypt	Hashing de contraseñas
Lombok	Reducción de código repetitivo
Bean Validation	Validación de solicitudes
Maven Wrapper	Gestión de dependencias
Frontend
Tecnología	Utilización
React 19	Biblioteca de interfaces
Vite 8	Herramienta de desarrollo y compilación
Axios	Cliente HTTP
CSS3	Estilos y diseño responsivo
🏗️ Arquitectura del flujo de autenticación

SecureBase utiliza una estrategia de autenticación basada en dos tokens independientes.

text
                  REACT CLIENT
                       |
                       |
                GET /auth/csrf
                       |
                       v
                Cookie XSRF-TOKEN
                       |
                       |
                POST /auth/login
                + X-XSRF-TOKEN
                       |
                       v
                 SPRING SECURITY
                       |
                       v
                Validación de credenciales
                       |
                +------+------+
                |             |
                v             v
             Access JWT   Refresh Token
             JSON         Cookie HttpOnly
                |             |
                v             v
          Memoria del     Cookie del
             cliente       navegador
                |             |
                v             v
         Requests API    POST /auth/refresh
                              |
                              v
                       Validación del token
                       Bloqueo en BD
                       Rotación del token
                              |
                              v
                       Nuevo par de tokens

Estrategia de almacenamiento
Token	Almacenamiento	Función
Access Token	Memoria del cliente	Autorizar solicitudes protegidas
Refresh Token	Cookie HttpOnly	Renovar sesiones
Hash del Refresh Token	MySQL	Validar y revocar sesiones
📁 Estructura del proyecto
text
SecureBase/
│
├── backend/
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agustinperez/proyectoSecurity/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── exception/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   └── service/
│   │   │   └── resources/
│   │   └── test/
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── auth/
│   │   ├── context/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🚀 Instalación y ejecución local
Requisitos previos
JDK 17 o versión compatible con el proyecto.
Node.js 20+.
npm.
MySQL 8+.
1. Clonar el repositorio
bash
git clone https://github.com/Agustin771/SecureBase-Full-Stack-Authentication-RBAC-Starter.git

cd SecureBase-Full-Stack-Authentication-RBAC-Starter

2. Configuración del Backend

Crear una base de datos en MySQL:

sql
CREATE DATABASE secure_base_db;


Configurar las siguientes variables de entorno antes de iniciar Spring Boot:

Variable	Descripción
URL_BD	URL de conexión a MySQL
USERNAME_BD	Usuario de MySQL
PASSWORD_BD	Contraseña de MySQL
JWT_SECRET_KEY	Secreto Base64 para firmar JWT
JWT_EXPIRATION	Duración del Access Token en milisegundos
EMAIL_USERNAME	Correo utilizado para SMTP
EMAIL_PASSWORD	Contraseña de aplicación SMTP
CORS_ALLOWED_ORIGINS	Origen permitido para el frontend

Ejemplo de configuración para desarrollo local:

properties
URL_BD=jdbc:mysql://localhost:3306/secure_base_db
USERNAME_BD=root
PASSWORD_BD=tu_contraseña_mysql

JWT_SECRET_KEY=TU_SECRETO_BASE64
JWT_EXPIRATION=900000

EMAIL_USERNAME=tu_correo@gmail.com
EMAIL_PASSWORD=tu_app_password

CORS_ALLOWED_ORIGINS=http://localhost:5173


Generar un secreto JWT aleatorio y seguro de al menos 256 bits.

Importante: nunca subir credenciales reales, contraseñas SMTP ni secretos JWT al repositorio.

Iniciar el backend desde la carpeta raíz:

Windows:

powershell
cd backend
.\mvnw.cmd spring-boot:run


Linux / macOS:

bash
cd backend
./mvnw spring-boot:run


El backend estará disponible en:

http://localhost:8080

3. Configuración del Frontend

Ingresar a la carpeta frontend:

bash
cd frontend


Instalar dependencias:

bash
npm install


Crear un archivo .env tomando como referencia .env.example:

env
VITE_API_URL=http://localhost:8080


Iniciar el servidor de desarrollo:

bash
npm run dev


El frontend estará disponible en:

http://localhost:5173

📡 Endpoints principales
Método	Endpoint	Acceso	Descripción
GET	/auth/csrf	Público	Inicializa el token CSRF para la SPA
POST	/auth/register	Público	Registra un nuevo usuario
POST	/auth/verify	Público	Verifica el correo mediante OTP
POST	/auth/resend-verification	Público	Reenvía el código de verificación
GET	/auth/verification-status	Público	Consulta el tiempo restante de espera
POST	/auth/login	Público	Autentica al usuario
POST	/auth/refresh	Cookie-based	Rota el Refresh Token
POST	/auth/logout	Cookie-based	Revoca la sesión activa
POST	/auth/forgot-password	Público	Inicia la recuperación de contraseña
POST	/auth/reset-password	Público	Restablece la contraseña
GET	/auth/me	Autenticado	Devuelve los datos del usuario actual
GET	/prueba	ROLE_ADMIN	Endpoint protegido para administradores

Nota: los endpoints basados en cookies requieren una cookie Refresh Token válida y la cabecera CSRF correspondiente.

🔒 Consideraciones de seguridad

SecureBase incorpora diferentes mecanismos de protección:

Access Tokens de corta duración.
Refresh Tokens almacenados en cookies HttpOnly.
Rotación de Refresh Tokens.
Persistencia hasheada de tokens.
Protección CSRF para aplicaciones SPA.
Hashing de contraseñas mediante BCrypt.
Expiración y cooldown de códigos OTP.
Revocación de sesiones después del restablecimiento de contraseñas.
Bloqueos pesimistas para operaciones concurrentes sensibles.

Para despliegues productivos se recomienda configurar HTTPS, cookies seguras, secretos independientes por entorno, políticas CORS restrictivas y permisos adecuados para la base de datos.

El proyecto constituye una base de autenticación orientada a la seguridad y requiere una revisión específica antes de utilizarse en producción.

👨‍💻 Autor

Agustín Pérez

GitHub: @Agustin771

Repositorio: SecureBase
