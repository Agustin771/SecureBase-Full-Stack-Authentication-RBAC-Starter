<p align="center">
  <img width="1234" height="625" alt="image" src="https://github.com/user-attachments/assets/b6a60c48-3b27-42f7-a0f7-d0204e0858f9" />
  <img width="1195" height="493" alt="image" src="https://github.com/user-attachments/assets/6ce20f8a-e8ec-4382-94d0-2ea1068e96dd" />
</p>

# 🔐 SecureBase
### Full-Stack Authentication & Role-Based Access Control Starter

Una solución full-stack de autenticación y autorización desarrollada con Spring Boot, Spring Security, React y MySQL, diseñada para implementar una gestión segura de usuarios, sesiones y permisos.

SecureBase implementa un sistema de autenticación basado en Access Tokens y Refresh Tokens, rotación automática de sesiones, protección CSRF para aplicaciones SPA, verificación de cuentas por correo electrónico y recuperación segura de contraseñas.

El proyecto está diseñado como una base reutilizable para aplicaciones que requieren un sistema de autenticación robusto, con especial atención a la seguridad, la consistencia de datos y el control de acceso.

---

## ✨ Características principales

### 🔑 Autenticación y gestión de sesiones
* **JWT Access Tokens:** tokens de corta duración almacenados exclusivamente en memoria del cliente.
* **Refresh Tokens:** almacenados en cookies HttpOnly, inaccesibles desde JavaScript.
* **Rotación automática:** cada renovación genera un nuevo Refresh Token e invalida el anterior.
* **Persistencia segura:** los Refresh Tokens se almacenan hasheados mediante SHA-256 en MySQL.
* **Revocación de sesiones:** las sesiones activas se revocan después de un restablecimiento de contraseña.

### 🛡️ Seguridad
* Spring Security con autenticación *stateless*.
* Protección CSRF para aplicaciones SPA mediante `csrf.spa()`.
* Cookie `XSRF-TOKEN` y cabecera `X-XSRF-TOKEN`.
* Hashing de contraseñas mediante BCrypt.
* Manejadores personalizados de autenticación y acceso denegado.
* Configuración CORS.
* Validación de solicitudes mediante Bean Validation.

### 📧 Gestión del ciclo de vida de cuentas
* Registro de usuarios.
* Verificación de correo electrónico mediante códigos OTP de 6 dígitos.
* Expiración de códigos después de 15 minutos.
* Límite de intentos de verificación.
* Cooldown de 60 segundos para reenviar códigos.
* Recuperación y restablecimiento seguro de contraseñas.
* Revocación de sesiones activas después del cambio de contraseña.

### ⚙️ Concurrencia y consistencia
* Bloqueos pesimistas mediante `PESSIMISTIC_WRITE` en JPA.
* Prevención de condiciones de carrera durante la rotación de Refresh Tokens.
* Control de concurrencia durante la validación de códigos OTP.

### 👥 Control de acceso (RBAC)
* Roles `ROLE_USER` y `ROLE_ADMIN`.
* Inicialización automática de roles al iniciar la aplicación.
* Protección de endpoints según los permisos del usuario autenticado.

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Utilización |
| :--- | :--- |
| **Java 17** | Lenguaje de programación |
| **Spring Boot 4.1.1** | Framework backend |
| **Spring Security** | Autenticación y autorización |
| **Spring Data JPA** | Persistencia de datos |
| **MySQL 8+** | Base de datos relacional |
| **JJWT 0.12.6** | Generación y validación de JWT |
| **Jakarta Mail** | Envío de correos electrónicos |
| **BCrypt** | Hashing de contraseñas |
| **Lombok** | Reducción de código repetitivo |
| **Bean Validation** | Validación de solicitudes |
| **Maven Wrapper** | Gestión de dependencias |

### Frontend
| Tecnología | Utilización |
| :--- | :--- |
| **React 19** | Biblioteca de interfaces |
| **Vite 8** | Desarrollo y compilación |
| **Axios** | Cliente HTTP |
| **CSS3** | Estilos y diseño responsivo |

---

## 🏗️ Arquitectura de autenticación

SecureBase utiliza una estrategia de autenticación basada en dos tokens independientes, cada uno con una responsabilidad específica.

### Flujo de autenticación
```text
                    REACT CLIENT
                         |
                         v
                   GET /auth/csrf
                         |
                         v
                   Cookie XSRF-TOKEN
                         |
                         v
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
                (JSON)     (HttpOnly Cookie)
                  |             |
                  v             v
             Memoria del    Navegador
               cliente          |
                                v
                       POST /auth/refresh
                                |
                                v
                       Validación del token
                                |
                         Bloqueo en BD
                                |
                         Rotación del token
                                |
                                v
                       Nuevo par de tokens
Estrategia de almacenamiento
Elemento	Almacenamiento	Responsabilidad
Access Token	Memoria del cliente	Autorizar solicitudes protegidas
Refresh Token	Cookie HttpOnly	Renovar sesiones
Hash del Refresh Token	MySQL	Validar y revocar sesiones
¿Por qué utilizar dos tokens?
Esta estrategia permite mantener los Access Tokens fuera del almacenamiento persistente del navegador, mientras que los Refresh Tokens se gestionan mediante cookies HttpOnly. La rotación de Refresh Tokens permite renovar las sesiones e invalidar los tokens anteriores.

📁 Estructura del proyecto
Plaintext
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
Asegúrate de tener instalado:

JDK 17 o versión compatible.

Node.js 20+ y npm.

MySQL 8+.

1. Clonar el repositorio
Bash
git clone [https://github.com/Agustin771/SecureBase-Full-Stack-Authentication-RBAC-Starter.git](https://github.com/Agustin771/SecureBase-Full-Stack-Authentication-RBAC-Starter.git)
cd SecureBase-Full-Stack-Authentication-RBAC-Starter
2. Configurar la base de datos
Crear la base de datos en MySQL:

SQL
CREATE DATABASE secure_base_db;
3. Configurar variables de entorno del backend
Configura las siguientes variables antes de iniciar Spring Boot:

Variable	Descripción
URL_BD	URL de conexión a MySQL
USERNAME_BD	Usuario de MySQL
PASSWORD_BD	Contraseña de MySQL
JWT_SECRET_KEY	Secreto Base64 para firmar JWT
JWT_EXPIRATION	Duración del Access Token en milisegundos
EMAIL_USERNAME	Correo utilizado para SMTP
EMAIL_PASSWORD	Contraseña de aplicación SMTP
CORS_ALLOWED_ORIGINS	Orígenes permitidos para el frontend
Ejemplo de configuración para desarrollo local (application.properties o variables de entorno):

Properties
URL_BD=jdbc:mysql://localhost:3306/secure_base_db
USERNAME_BD=root
PASSWORD_BD=tu_contraseña_mysql

JWT_SECRET_KEY=TU_SECRETO_BASE64
JWT_EXPIRATION=900000

EMAIL_USERNAME=tu_correo@gmail.com
EMAIL_PASSWORD=tu_app_password

CORS_ALLOWED_ORIGINS=http://localhost:5173
⚠️ Importante: Genera un secreto JWT aleatorio y seguro de al menos 256 bits. Nunca subas credenciales reales, contraseñas SMTP ni secretos JWT al repositorio.

4. Iniciar el backend
Desde la carpeta raíz del proyecto:

Windows (PowerShell):

PowerShell
cd backend
.\mvnw.cmd spring-boot:run
Linux / macOS:

Bash
cd backend
./mvnw spring-boot:run
El backend estará disponible en http://localhost:8080.

5. Configurar el frontend
Ingresar a la carpeta frontend:

Bash
cd frontend
npm install
Crear un archivo .env tomando como referencia .env.example:

Fragmento de código
VITE_API_URL=http://localhost:8080
Iniciar el servidor de desarrollo:

Bash
npm run dev
El frontend estará disponible en http://localhost:5173.

📡 Endpoints principales
Autenticación y gestión de cuentas
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
Endpoints protegidos
Método	Endpoint	Acceso	Descripción
GET	/prueba	ROLE_ADMIN	Endpoint protegido para administradores
Nota: los endpoints basados en cookies requieren una cookie Refresh Token válida y la cabecera CSRF correspondiente.

🔒 Consideraciones de seguridad
SecureBase incorpora diferentes mecanismos de protección para reducir los riesgos asociados a la autenticación:

Access Tokens de corta duración en memoria.

Refresh Tokens almacenados en cookies HttpOnly con rotación automática.

Persistencia hasheada de tokens en base de datos.

Protección CSRF adaptada para aplicaciones SPA.

Hashing de contraseñas mediante BCrypt.

Expiración, cooldown y límite de intentos para códigos OTP.

Revocación automática de sesiones tras restablecer la contraseña.

Bloqueos pesimistas para operaciones concurrentes sensibles.

Recomendaciones para producción
Antes de desplegar en producción:

Configurar HTTPS obligatoriamente.

Asegurar banderas de cookies (Secure, SameSite=Strict o Lax).

Mantener secretos independientes y seguros por entorno.

Aplicar políticas CORS restrictivas acorde a tu dominio.

👨‍💻 Autor
Agustín Pérez

GitHub: @Agustin771
