# 📖 Diccionario de Datos: Sistema ABA HR

Este documento detalla la estructura de la base de datos del sistema **ABA Talent Management**, incluyendo tablas, campos, tipos de datos y relaciones.

---

## 1. Módulo: Autenticación y Seguridad (Auth)

### Tabla: `users`
Almacena las credenciales y el estado de los usuarios del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único del usuario. |
| `email` | String (Unique) | Correo electrónico de inicio de sesión. |
| `passwordHash` | String | Contraseña cifrada. |
| `isActive` | Boolean | Indica si la cuenta está habilitada. |
| `isEmailVerified` | Boolean | Estado de verificación del correo. |
| `lastLoginAt` | DateTime | Fecha y hora del último acceso. |
| `mfaEnabled` | Boolean | Indica si tiene autenticación de dos factores. |

### Tabla: `roles`
Define los perfiles de acceso (ej. Super Admin, HR Manager).

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único del rol. |
| `name` | String | Nombre del rol. |
| `isSystem` | Boolean | Indica si es un rol predefinido del sistema. |

---

## 2. Módulo: Gestión de Empleados (Employees)

### Tabla: `employees`
Contiene la información detallada de cada colaborador.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único del empleado. |
| `employeeCode` | String (Unique) | Código interno (ej. EMP-001). |
| `userId` | UUID (FK) | Relación con la tabla `users`. |
| `firstName` | String | Primer nombre. |
| `lastName` | String | Apellido. |
| `nationalId` | String (Unique) | Documento de identidad nacional. |
| `jobTitle` | String | Título del cargo. |
| `employmentStatus` | Enum | Estado actual (ACTIVE, PROBATION, etc.). |
| `baseSalary` | Decimal | Salario base mensual. |
| `departmentId` | UUID (FK) | Departamento al que pertenece. |

---

## 3. Módulo: Organización (Org Structure)

### Tabla: `departments`
Define las unidades organizativas de la empresa.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador del departamento. |
| `name` | String | Nombre del departamento. |
| `code` | String | Código único del departamento. |
| `parentId` | UUID (FK) | Departamento superior (jerarquía). |
| `headId` | String | ID del empleado que lidera el departamento. |

---

## 4. Módulo: Asistencia y Tiempos (Attendance)

### Tabla: `attendances`
Registra la jornada laboral diaria.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador del registro. |
| `employeeId` | UUID (FK) | Empleado que registra. |
| `date` | Date | Fecha del registro. |
| `checkIn` | DateTime | Hora de entrada. |
| `checkOut` | DateTime | Hora de salida. |
| `status` | Enum | Estado (PRESENT, LATE, ABSENT, etc.). |

---

## 5. Módulo: Nómina (Payroll)

### Tabla: `payroll_items`
Detalle individual de pago por empleado en un periodo.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador de la línea de nómina. |
| `payrollId` | UUID (FK) | Relación con el proceso de nómina general. |
| `employeeId` | UUID (FK) | Empleado beneficiario. |
| `grossPay` | Decimal | Pago bruto antes de deducciones. |
| `netPay` | Decimal | Pago neto a recibir. |

---

## 6. Módulo: Reclutamiento (Recruitment)

### Tabla: `job_postings`
Almacena las vacantes publicadas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador de la vacante. |
| `title` | String | Título del puesto. |
| `status` | Enum | Estado (OPEN, CLOSED, DRAFT). |
| `openingsCount` | Int | Número de plazas disponibles. |

---

## 7. Módulo: Auditoría y Sistema (System)

### Tabla: `audit_logs`
Registro histórico de todas las acciones realizadas en el sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador del log. |
| `userId` | UUID (FK) | Usuario que realizó la acción. |
| `action` | Enum | Acción (CREATE, UPDATE, DELETE, LOGIN). |
| `resource` | String | Nombre del modelo/tabla afectado. |
| `oldValues` | Json | Valores anteriores al cambio. |
| `newValues` | Json | Valores posteriores al cambio. |

---

## Resumen de Convenciones
- **PK**: Primary Key (Identificador único).
- **FK**: Foreign Key (Clave foránea para relaciones).
- **Soft Delete**: El sistema utiliza el campo `deletedAt` para eliminaciones lógicas en lugar de físicas para preservar la integridad histórica.
- **Tipos de Datos**:
  - `UUID`: Identificadores únicos universales.
  - `Decimal(14,2)`: Para montos monetarios precisos.
  - `Json`: Para datos semiestructurados (ej. configuraciones o historiales).
