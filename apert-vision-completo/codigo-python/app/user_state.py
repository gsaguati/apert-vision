"""Módulo singleton para el estado del usuario autenticado."""

_current_user: dict | None = None


def login(email: str, name: str = ""):
    global _current_user
    _current_user = {"email": email, "name": name or email.split("@")[0].capitalize()}


def logout():
    global _current_user
    _current_user = None


def get() -> dict | None:
    return _current_user


def is_logged_in() -> bool:
    return _current_user is not None
