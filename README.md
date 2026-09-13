# JOY Catering Management Platform — Java version

The original Python/FastAPI backend has been converted to a **Java 17 + Spring Boot + Spring Data JPA + Spring Security + PostgreSQL** backend.

## Project structure

- `backend/` — converted Java/Spring Boot API
- `frontend/` — original React/Vite frontend, kept unchanged
- `backend/pom.xml` — Maven dependencies
- `backend/src/main/java/com/joy/catering/` — controllers, services, entities, repositories, security and DTOs

## Main Python → Java mapping

| Python | Java |
|---|---|
| FastAPI | Spring Boot REST |
| SQLAlchemy ORM | Spring Data JPA / Hibernate |
| Pydantic schemas | Java records + Jakarta Bean Validation |
| PyJWT | JJWT |
| PasswordHasher | Spring Security BCrypt |
| Depends/current_user | Spring Security + JWT filter |
| APIRouter | `@RestController` |
| HTTPException | `ApiException` |
| `.env` settings | `application.properties` / environment variables |

## Run

Requirements: **JDK 17+, Maven 3.9+, PostgreSQL**.

1. Create a PostgreSQL database named `catering`.
2. Set the database credentials and a JWT secret.
3. From `backend/`, run:

```bash
mvn spring-boot:run
```

The API runs on `http://127.0.0.1:8000`.

For the frontend, from `frontend/`:

```bash
npm install
npm run dev
```

The frontend already points to `http://127.0.0.1:8000` by default.

## Environment variables

```text
DATABASE_URL=jdbc:postgresql://localhost:5432/catering
DB_USERNAME=catering
DB_PASSWORD=YOUR_LOCAL_PASSWORD
JWT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
ACCESS_TOKEN_MINUTES=30
ENVIRONMENT=development
DEV_RESET_TOKENS=false
```

> Do not copy the old Python `DATABASE_URL` value (`postgresql+psycopg://...`) directly. Spring expects the JDBC form shown above.

`spring.jpa.hibernate.ddl-auto=update` is used so Hibernate creates/updates the tables automatically during local development.

## Important

The business rules and API paths were kept compatible with the existing React frontend, including:

- `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- `/event-types`, `/menu-items`, `/packages`
- `/staff/event-types`, `/staff/menu-items`, `/staff/packages`
- `/bookings`
- `/staff/bookings/{id}/approve`
- `/staff/bookings/{id}/reject`
- `/customers/me/profile`
- `/admin/users`

The frontend itself remains TypeScript/React because the request was to convert the **Python backend** to Java.
