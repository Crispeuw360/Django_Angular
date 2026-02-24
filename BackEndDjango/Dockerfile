# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim as base

# Evita que Python genere archivos .pyc y permite ver logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 1. Crear el usuario 'appuser' (sin privilegios de root)
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# 2. Instalar dependencias
# Se hace antes de copiar el código para aprovechar la caché de Docker
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

# 3. COPIAR el código y ASIGNAR PERMISOS (¡Esta es la clave!)
# Al usar --chown, el 'appuser' podrá escribir en la base de datos SQLite
COPY --chown=appuser:appuser . .

RUN chown appuser:appuser /app

# 4. Collect static files
RUN python manage.py collectstatic --noinput

# 5. Cambiar al usuario limitado por seguridad
USER appuser

# Exponer el puerto
EXPOSE 8000

# 5. Comando de arranque (usando formato de lista para mejor estabilidad)
CMD ["gunicorn", "djangoCrud.wsgi", "--bind", "0.0.0.0:8000"]